require('fs').writeFileSync(process.argv[1], Buffer.from(process.argv[2], 'base64').toString(), 'utf8')
