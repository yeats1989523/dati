// /pages/home_level3/home.js

// 引入三级题库数据
const { questions } = require('../../utils/questions_level3.js'); 
const LEVEL = 3; // 定义一个常量表示等级

Page({
  /**
   * 页面的初始数据
   */
  data: {
    totalQuestions: 0,
    totalDone: 0,
    accuracy: '0.0',
    mistakeCount: 0,
    favoriteCount: 0,
    categories: [
      { type: 1, name: '判断题', total: 0, done: 0, progress: '0.0' },
      { type: 2, name: '单选题', total: 0, done: 0, progress: '0.0' },
      { type: 3, name: '多选题', total: 0, done: 0, progress: '0.0' }
    ]
  },

  /**
   * 生命周期函数--监听页面显示
   * 确保每次返回此页面时，数据都能刷新
   */
  onShow() {
    this.updateStats();
    // 动态设置当前页的导航栏标题
    wx.setNavigationBarTitle({ title: '三级-学习中心' });
  },

  /**
   * 更新首页的所有统计数据
   */
  updateStats() {
    // 使用带等级的、独立的存储键，确保数据隔离
    const progress = wx.getStorageSync(`quizProgress_level${LEVEL}`) || {};
    const favorites = wx.getStorageSync(`quizFavorites_level${LEVEL}`) || {};
    
    let totalDone = 0;
    let correctCount = 0;
    let mistakeCount = 0;
    
    const categoryStats = { 
      1: { total: 0, done: 0 }, 
      2: { total: 0, done: 0 }, 
      3: { total: 0, done: 0 } 
    };

    questions.forEach(q => {
      categoryStats[q.type].total++;
      if (progress[q.id]) {
        categoryStats[q.type].done++;
        totalDone++;
        if (progress[q.id] === 'correct') {
          correctCount++;
        } else {
          mistakeCount++;
        }
      }
    });

    const updatedCategories = this.data.categories.map(cat => {
      const total = categoryStats[cat.type].total;
      const done = categoryStats[cat.type].done;
      const progressPercentage = total > 0 ? (done / total * 100) : 0;
      return { ...cat, total, done, progress: progressPercentage.toFixed(1) };
    });

    this.setData({
      totalQuestions: questions.length,
      totalDone,
      accuracy: totalDone > 0 ? (correctCount / totalDone * 100).toFixed(1) : '0.0',
      mistakeCount,
      favoriteCount: Object.keys(favorites).length,
      categories: updatedCategories
    });
  },

  /**
   * 跳转到答题页面
   */
  goToQuiz(e) {
    const { type, mode } = e.currentTarget.dataset;
    // 跳转时传递 level 参数，告知答题页加载三级题库
    wx.navigateTo({
      url: `/pages/quiz/quiz?type=${type}&mode=${mode || 'all'}&level=${LEVEL}`
    });
  },

  /**
   * 重置学习进度
   */
  resetProgress() {
    wx.showModal({
      title: '确认操作',
      content: '您确定要清空三级的所有答题记录和收藏吗？',
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          // 清空带等级的存储键
          wx.removeStorageSync(`quizProgress_level${LEVEL}`);
          wx.removeStorageSync(`quizFavorites_level${LEVEL}`);
          this.updateStats();
          wx.showToast({ title: '已重置', icon: 'success' });
        }
      }
    });
  }
});