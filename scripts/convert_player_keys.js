const fs = require('fs');
const path = require('path');

// 读取原始数据
const dataPath = path.join(__dirname, '../public/data/sports_data.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

// 转换players对象的键名
const newPlayers = {};
for (const [oldKey, playerData] of Object.entries(data.players)) {
    const newKey = playerData.name; // 使用name字段作为新的键名
    newPlayers[newKey] = playerData;
}

// 更新data对象
data.players = newPlayers;

// 写回文件
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log('转换完成！');
console.log(`总共转换了 ${Object.keys(newPlayers).length} 个选手列表`);