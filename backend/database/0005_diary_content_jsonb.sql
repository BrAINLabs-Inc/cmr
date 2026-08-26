-- The diary editor is now a rich-text editor (TipTap) instead of a plain
-- textarea. Its native save format is a structured JSON document, which is
-- also a better fit for Postgres than a raw HTML/text blob: jsonb is stored
-- compactly (binary, deduplicated keys), is validated/queryable, and avoids
-- ever persisting free-form HTML.
--
-- Existing plain-text entries are wrapped in a single paragraph node so no
-- content is lost.

alter table diary_entries
  alter column content drop default;

alter table diary_entries
  alter column content type jsonb using
    case
      when content is null or content = '' then '{"type":"doc","content":[]}'::jsonb
      else jsonb_build_object(
        'type', 'doc',
        'content', jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph',
            'content', jsonb_build_array(
              jsonb_build_object('type', 'text', 'text', content)
            )
          )
        )
      )
    end;

alter table diary_entries
  alter column content set default '{"type":"doc","content":[]}'::jsonb;

alter table diary_entries
  alter column content set not null;
