# Chat Persistence

Implement chat persistence to save/load messages and state in JSONL format for resuming sessions.

**Detailed requirements:**
- [ ] Create src/llm/Chat.js class with init(): creates UUID-based chat dir under root="chat", saves id to chat/current (file or symlink). If id provided, loads from chat/{id}, verifies with current. Handle --new: archive old dir to archive/{short-hash} (base36 from UUID parts), create new UUID dir, update current.
- [ ] Implement add(message): appends to messages array (supports role/content).
- [ ] Implement save(target, data, step?): saves to specific file; if no target saves messages.jsonl as JSON array (one per line). Step-specific: prepends "steps/{step:03d}/" (e.g. steps/001/answer.md). Handle all allowed files: input.md, prompt.md, model.json, files.jsonl (array<string>), inputs.jsonl (array<string>), response.json (obj), parts jsonl (stream events), stream.md (text), chunks jsonl (array), unknowns jsonl (array<[string,any]>), answer.md, reason.md, usage.json (obj), fail.json (obj), messages.jsonl.
- [ ] Implement load(target, step?): loads from specific file or all messages from messages.jsonl (repair malformed lines, skip errors). Step-specific loads from steps/{step:03d}/{target}.
- [ ] Archive: on --new, generate short ID from UUID (split '-', parseInt(hex,16).toString(36), join), zip old /chat/UUID to /archive/<short>/chat.zip (all files) + chat.json (metadata: id, date, usage sum). Use adm-zip? For tests, mock zip creation.
- [ ] Resume: extract zip to /chat/{old-id}, set chat/current to old-id, load messages. Delete/clear: rm current or archive/short, llimo clear rm -rf /archive (confirm >1 file).

**Examples:**
- Init: new Chat({cwd:'/proj', root:'chat'}) → creates chat/uuid, empty messages.jsonl, updates current=uuid.
- Add/save: chat.add({role:'user', content:'hi'}); await chat.save() → writes chat/uuid/messages.jsonl.
- Step save: chat.save('answer', "content", 1) → chat/steps/001/answer.md; chat.save({answer, step:1}) → all in steps/001/.
- Archive: oldUuid → archive/abcd/chat.zip + json; new chat dir created.
- Load: new Chat({id:'uuid', cwd:'/proj'}) → loads messages.jsonl into this.messages.

Tests: src/llm/Chat.test.js (init/current, save/load messages, step-specific saves/loads e.g. answer.md/usage.json/parts.jsonl, archive/zip round-trip, resume logic with temp dirs; cover all allowed files).

Deps: 1.2 (stdin/file for init files).

Security: Path.resolve all ids/paths (block ../); limit array sizes (e.g. messages<1000); safe JSONL repair (escape \n in content, truncate unparsable>10KB).

After code: Run tests from tests.txt, then pnpm test:all.
