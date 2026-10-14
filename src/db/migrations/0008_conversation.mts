import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    create table conversation (
      id uuid primary key default gen_random_uuid(),
      listing_id uuid references listing(id) on delete set null,
      buyer_id uuid not null references "user"(id) on delete cascade,
      seller_id uuid not null references "user"(id) on delete cascade,
      created_at timestamptz not null default now(),
      last_message_at timestamptz not null default now(),
      constraint conversation_listing_id_buyer_id_key unique (listing_id, buyer_id),
      constraint conversation_buyer_is_not_seller_check check (buyer_id <> seller_id)
    )
  `.execute(db);

  await sql`create index conversation_buyer_id_idx on conversation (buyer_id, last_message_at desc)`.execute(
    db,
  );
  await sql`create index conversation_seller_id_idx on conversation (seller_id, last_message_at desc)`.execute(
    db,
  );

  await sql`
    create table message (
      id uuid primary key default gen_random_uuid(),
      conversation_id uuid not null references conversation(id) on delete cascade,
      sender_id uuid not null references "user"(id) on delete cascade,
      body text not null,
      created_at timestamptz not null default now(),
      read_at timestamptz,
      constraint message_body_check check (length(body) between 1 and 2000)
    )
  `.execute(db);

  await sql`create index message_conversation_id_idx on message (conversation_id, created_at)`.execute(
    db,
  );
}
