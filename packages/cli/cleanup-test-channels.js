#!/usr/bin/env node

/**
 * 手动清理测试频道的工具脚本
 * 用于清理集成测试后可能遗留的测试频道
 */

const { execSync } = require('child_process');
const path = require('path');

const cliPath = path.join(__dirname, 'dist', 'index.js');

async function cleanupTestChannels() {
  console.log('🔍 正在查找测试频道...');
  
  try {
    // 首先列出所有频道
    const listOutput = execSync(`node ${cliPath} channel list --output json --limit 100`, {
      encoding: 'utf8'
    });
    
    // console.log('📄 频道列表输出:', listOutput.trim());
    
    let channels;
    try {
      channels = JSON.parse(listOutput);
    } catch (parseError) {
      console.log('❌ JSON解析失败，尝试提取JSON部分...');
      // 尝试提取JSON部分
      const jsonMatch = listOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        channels = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法找到有效的JSON数据');
      }
    }
    
    if (!channels.channels || !Array.isArray(channels.channels)) {
      console.log('❌ 无法获取频道列表');
      console.log('📄 频道数据结构:', Object.keys(channels));
      return;
    }
    
    // 查找测试频道（名称包含 "Test" 的频道）
    const testChannels = channels.channels.filter(channel => 
      channel.name && channel.name.includes('Test')
    );
    
    if (testChannels.length === 0) {
      console.log('✅ 没有发现测试频道需要清理');
      return;
    }
    
    console.log(`🎯 发现 ${testChannels.length} 个测试频道:`);
    testChannels.forEach(channel => {
      console.log(`  - ${channel.channelId}: ${channel.name}`);
    });
    
    // 清理测试频道
    const channelIds = testChannels.map(ch => ch.channelId.toString());
    
    if (channelIds.length > 0) {
      console.log(`\n🧹 开始清理 ${channelIds.length} 个测试频道...`);
      
      try {
        // 尝试批量删除
        const channelIdsStr = channelIds.join(' ');
        execSync(`node ${cliPath} channel batch-delete --channelIds ${channelIdsStr} --force`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log(`✅ 批量清理成功: ${channelIds.length} 个频道`);
      } catch (batchError) {
        console.log(`⚠️  批量清理失败，尝试逐个清理...`);
        
        let successCount = 0;
        let failedChannels = [];
        
        // 逐个删除
        for (const channelId of channelIds) {
          try {
            execSync(`node ${cliPath} channel delete --channelId ${channelId} --force`, {
              encoding: 'utf8',
              stdio: ['pipe', 'pipe', 'pipe']
            });
            console.log(`✅ 成功清理频道: ${channelId}`);
            successCount++;
          } catch (individualError) {
            console.log(`❌ 清理失败频道: ${channelId} - ${individualError.message}`);
            failedChannels.push(channelId);
          }
        }
        
        console.log(`\n📊 清理总结:`);
        console.log(`  - 成功: ${successCount} 个`);
        console.log(`  - 失败: ${failedChannels.length} 个`);
        
        if (failedChannels.length > 0) {
          console.log(`\n❌ 以下频道清理失败，可能需要手动处理:`);
          failedChannels.forEach(id => console.log(`  - ${id}`));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 清理过程出错:', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  cleanupTestChannels().catch(console.error);
}

module.exports = { cleanupTestChannels };