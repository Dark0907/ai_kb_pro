// 打字机队列
export class Typewriter {
  constructor(onConsume) {
    this.queue = []; // 字符队列
    this.consuming = false; // 消费状态
    this.timmer = null; // 定时器
    this.onConsume = onConsume; // 消费回调
  }

  // 输出速度动态控制
  dynamicSpeed() {
    const speed = 2000 / this.queue.length;
    return speed > 200 ? 200 : speed; // 返回最小速度为 200ms
  }

  // 添加字符串到队列
  add(str) {
    if (!str) return;
    this.queue.push(...str.split('')); // 将字符串拆分为字符并添加到队列
  }

  // 消费
  consume() {
    if (this.queue.length > 0) {
      const str = this.queue.shift(); // 从队列中取出第一个字符
      if (str) this.onConsume(str); // 调用消费回调
    }
  }

  // 消费下一个
  next() {
    this.consume();
    // 根据队列中字符的数量来设置消耗每一帧的速度，用定时器消耗
    this.timmer = setTimeout(() => {
      this.consume();
      if (this.consuming) {
        this.next(); // 继续消费
      }
    }, this.dynamicSpeed());
  }

  // 开始消费队列
  start() {
    this.consuming = true; // 设置为正在消费
    this.next(); // 开始消费
  }

  // 结束消费队列
  done() {
    this.consuming = false; // 设置为不再消费
    clearTimeout(this.timmer); // 清除定时器
    // 把 queue 中剩下的字符一次性消费
    this.onConsume(this.queue.join('')); // 调用消费回调
    this.queue = []; // 清空队列
  }
}
