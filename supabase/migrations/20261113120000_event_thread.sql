-- Event thread: a persistent conversation per party, used for pre-party
-- logistics, day-of messages and post-party thank yous.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  author_type text not null check (author_type in ('host', 'guest')),
  author_name text not null check (char_length(trim(author_name)) between 1 and 80),
  content text not null check (char_length(trim(content)) between 1 and 2000),
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_event_created_idx
  on public.messages (event_id, created_at);

alter table public.messages enable row level security;

-- Threads are as readable as the event itself: anyone holding the event link.
create policy "Anyone can read an event thread"
  on public.messages for select
  using (true);

-- Guests post anonymously, but cannot pose as the host and cannot self-pin.
create policy "Anyone can post to an event thread"
  on public.messages for insert
  with check (
    pinned = false
    and (
      author_type = 'guest'
      or exists (
        select 1 from public.events e
        where e.id = messages.event_id and e.organiser_id = auth.uid()
      )
    )
  );

-- Only the organiser pins or removes messages.
create policy "Organisers can pin messages on their events"
  on public.messages for update
  using (
    exists (
      select 1 from public.events e
      where e.id = messages.event_id and e.organiser_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = messages.event_id and e.organiser_id = auth.uid()
    )
  );

create policy "Organisers can delete messages on their events"
  on public.messages for delete
  using (
    exists (
      select 1 from public.events e
      where e.id = messages.event_id and e.organiser_id = auth.uid()
    )
  );

create policy "Admins can read all messages"
  on public.messages for select
  using (is_admin());

-- RLS decides which rows; these grants are the table-level gate that must
-- also be open. Guests act as `anon`, hosts as `authenticated`.
grant select, insert on public.messages to anon;
grant select, insert, update, delete on public.messages to authenticated;

alter table public.messages replica identity full;
alter publication supabase_realtime add table public.messages;
