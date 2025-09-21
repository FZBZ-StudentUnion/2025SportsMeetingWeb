const fs = require('fs');
const path = require('path');

// 定义目录路径
const gamesDir = path.join(__dirname, '../public/data/games');
const outputFile = path.join(__dirname, '../public/data/games.json');

// 存储所有游戏数据的对象
const allGames = {};

// 读取games目录下的所有文件
const files = fs.readdirSync(gamesDir);

// 过滤出JSON文件
const jsonFiles = files.filter(file => file.endsWith('.json'));

// 处理每个JSON文件
jsonFiles.forEach(file => {
  const filePath = path.join(gamesDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // 使用文件名（不带扩展名）作为键
    const key = path.basename(file, '.json');
    allGames[key] = data;
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
  }
});

// 将合并后的数据写入新文件
fs.writeFileSync(outputFile, JSON.stringify(allGames, null, 2));

console.log(`Successfully merged ${Object.keys(allGames).length} game files into ${outputFile}`);