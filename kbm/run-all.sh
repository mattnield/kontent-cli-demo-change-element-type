kbm --config=clean.json
kbm --config=restore.json
npm run migrate 01_demo_publishArticlesAfterRestore
npm run migrate 02_demo_changeArticleTitleType
