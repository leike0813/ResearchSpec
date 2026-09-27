1. shell: [non-CLI command; raw trace retained outside repository]
2. shell: [non-CLI command; raw trace retained outside repository]
3. shell: [non-CLI command; raw trace retained outside repository]
4. shell: [non-CLI command; raw trace retained outside repository]
5. shell: [non-CLI command; raw trace retained outside repository]
6. shell: [non-CLI command; raw trace retained outside repository]
7. shell: [non-CLI command; raw trace retained outside repository]
8. shell: [non-CLI command; raw trace retained outside repository]
9. shell: [non-CLI command; raw trace retained outside repository]
10. shell: [non-CLI command; raw trace retained outside repository]
11. shell: [non-CLI command; raw trace retained outside repository]
12. shell: /usr/bin/zsh -lc 'researchspec status --json 2>&1 | head -200'
13. shell: /usr/bin/zsh -lc 'researchspec list procedures --query "review response comment atomization" --json 2>&1 | head -200'
14. shell: /usr/bin/zsh -lc 'researchspec instructions procedure:design-review-response-intake --json 2>&1'
15. shell: [non-CLI command; raw trace retained outside repository]
16. shell: /usr/bin/zsh -lc "researchspec instructions procedure:analysis-review-response-manuscript-analysis --json 2>&1 | python3 -c \"import sys, json; d = json.load(sys.stdin); print(json.dumps(d['data']['packet']['procedure']['content'][:3500], ensure_ascii=False, indent=2))\""
17. shell: /usr/bin/zsh -lc "researchspec instructions procedure:analysis-review-response-manuscript-analysis --json 2>&1 | python3 -c \" import sys, json d = json.load(sys.stdin) c = d['data']['packet']['procedure']['content'] # Extract just the Procedure section after the YAML frontmatter parts = c.split('## Procedure', 1) if len(parts) > 1: print('## Procedure' + parts[1]) else: print(c[2000:5500]) \""
18. shell: /usr/bin/zsh -lc "researchspec instructions procedure:transform-review-response-comment-atomization --json 2>&1 | python3 -c \" import sys, json d = json.load(sys.stdin) c = d['data']['packet']['procedure']['content'] parts = c.split('## Procedure', 1) if len(parts) > 1: print('## Procedure' + parts[1]) else: print(c[2000:5500]) \""
19. shell: [non-CLI command; raw trace retained outside repository]
20. shell: [non-CLI command; raw trace retained outside repository]
21. shell: [non-CLI command; raw trace retained outside repository]
22. shell: [non-CLI command; raw trace retained outside repository]
23. shell: [non-CLI command; raw trace retained outside repository]
24. shell: [non-CLI command; raw trace retained outside repository]
