import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
  const { record } = await req.json(); // Data from the Webhook
  const group_id = record.group_id;

  // 1. Setup Supabase Client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // 2. WAIT 10 SECONDS (Batching Window)
  // This allows multiple joins to happen before we send the notification
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // 3. FETCH RECENT JOINS
  // Check how many people joined this group in the last 15 seconds
  const fifteenSecondsAgo = new Date(Date.now() - 15000).toISOString();

  const { data: recentMembers } = await supabase
    .from("group_members")
    .select(`
      user_id,
      users (full_name)
    `)
    .eq("group_id", group_id)
    .gte("joined_at", fifteenSecondsAgo);

  if (!recentMembers || recentMembers.length === 0) {
    return new Response("No joins to notify");
  }

  // 4. PREPARE THE MESSAGE
  const joinerCount = recentMembers.length;
  const firstJoinerName = recentMembers[0].users?.full_name || "A new member";

  const body = joinerCount === 1
    ? `${firstJoinerName} just joined the workspace!`
    : `${firstJoinerName} and ${
      joinerCount - 1
    } others just joined the workspace!`;

  // 5. FETCH TOKENS OF EXISTING MEMBERS (Excluding the new joiners)
  const joinerIds = recentMembers.map((m) => m.user_id);
  const { data: membersToNotify } = await supabase
    .from("group_members")
    .select("users(push_token)")
    .eq("group_id", group_id)
    .not("user_id", "in", `(${joinerIds.join(",")})`);

  const tokens = membersToNotify
    ?.map((m) => m.users?.push_token)
    .filter((token) => token !== null);

  if (!tokens || tokens.length === 0) return new Response("No tokens found");

  // 6. SEND TO EXPO
  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title: "New Workspace Member 🚀",
    body: body,
    data: { group_id },
  }));

  await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  return new Response(JSON.stringify({ sent: messages.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
