import json

with open('/Users/macbookair/.gemini/antigravity-ide/brain/ba0b46ba-1f57-426b-973c-907be4f170a3/.system_generated/logs/transcript_full.jsonl', 'r') as f:
    for line in f:
        data = json.loads(line)
        if 'content' in data:
            if 'export default function ProfessionalHome()' in data['content']:
                print("FOUND A MATCH!")
                print(data['content'][:1000]) # just to see where it comes from
                with open('extracted_home.txt', 'w') as out:
                    out.write(data['content'])
                break
