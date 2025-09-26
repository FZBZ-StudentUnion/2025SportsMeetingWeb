const fs = require('fs');
const path = require('path');

// 文件路径
const h2cFilePath = path.join(__dirname, '../public/data/h2c.json');
const playersFilePath = path.join(__dirname, '../public/data/players.json');
const gamesFilePath = path.join(__dirname, '../public/data/games.json');

// 读取文件
const h2cData = JSON.parse(fs.readFileSync(h2cFilePath, 'utf8'));
const playersData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));
const gamesData = JSON.parse(fs.readFileSync(gamesFilePath, 'utf8'));

// 将班级映射添加到games.json中
gamesData.classMapping = h2cData;

// 更新players.json中的class字段
Object.keys(playersData).forEach(gameId => {
  const game = playersData[gameId];
  if (game.players && Array.isArray(game.players)) {
    game.players.forEach(group => {
      if (Array.isArray(group)) {
        group.forEach(player => {
          if (player.name && h2cData[player.name]) {
            player.class = h2cData[player.name];
          }
        });
      }
    });
  }
});

// 保存更新后的文件
fs.writeFileSync(gamesFilePath, JSON.stringify(gamesData, null, 2), 'utf8');
fs.writeFileSync(playersFilePath, JSON.stringify(playersData, null, 2), 'utf8');

console.log('合并完成！');
console.log('1. 班级映射数据已添加到games.json中的classMapping字段');
console.log('2. players.json中的选手班级信息已更新');