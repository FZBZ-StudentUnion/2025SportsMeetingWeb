const fs = require('fs');
const path = require('path');

// 文件路径
const gamesFilePath = path.join(__dirname, '../public/data/games.json');
const playersFilePath = path.join(__dirname, '../public/data/players.json');
const mergedFilePath = path.join(__dirname, '../public/data/sports_data.json');

// 读取文件
const gamesData = JSON.parse(fs.readFileSync(gamesFilePath, 'utf8'));
const playersData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));

// 创建合并后的数据结构
const mergedData = {
  games: gamesData,
  players: playersData
};

// 保存合并后的文件
fs.writeFileSync(mergedFilePath, JSON.stringify(mergedData, null, 2), 'utf8');

console.log('合并完成！');
console.log(`已将games.json和players.json合并到${mergedFilePath}`);