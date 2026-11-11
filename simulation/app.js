(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const wait = 10000;
  const fresh = () => ({ state: 'CLOSED', calls: [], openedAt: 0, trials: [] });
  let model = fresh();
  let serviceUp = true;
  let probeResults = [];

  function render() {
    const count = model.calls.length;
    const failures = model.calls.filter(success => !success).length;
    const remaining = Math.max(0, Math.ceil((wait - (Date.now() - model.openedAt)) / 1000));
    $('state').textContent = model.state + (model.state === 'OPEN'
      ? remaining ? ` · chờ ${remaining}s` : ' · gửi request để thử'
      : '');
    $('count').textContent = `${count} / 5`;
    $('rate').textContent = count >= 5 ? `${Math.round(failures / count * 100)}%` : '—';
    $('trials').textContent = model.state === 'HALF_OPEN' ? `${model.trials.length} / 3` : '—';
    $('window').innerHTML = Array.from({ length: 5 }, (_, i) => {
      const filled = i < count;
      const label = filled ? model.calls[i] ? 'Thành công' : 'Thất bại' : 'Chưa có lời gọi';
      return `<span class="slot ${filled ? model.calls[i] ? 'ok' : 'fail' : ''}" title="${label}"></span>`;
    }).join('');
    $('service').textContent = serviceUp ? '● Đang chạy' : '● Đã tắt';
    $('service').classList.toggle('off', !serviceUp);
    $('service').setAttribute('aria-pressed', String(serviceUp));
    window.sorterMachine.update(model.state, model.calls, serviceUp, probeResults);
  }

  function open() {
    model.state = 'OPEN';
    model.openedAt = Date.now();
    model.trials = [];
  }

  function send() {
    if (model.state === 'OPEN') {
      if (Date.now() - model.openedAt < wait) {
        window.sorterMachine.request({ blocked: true });
        $('result').innerHTML = 'Proxy chặn lời gọi sang product-service. Fallback: <code>CallNotPermittedException</code>.';
        render();
        return;
      }
      model.state = 'HALF_OPEN';
      model.trials = [];
      probeResults = [];
    }
    window.sorterMachine.request({ success: serviceUp });
    if (model.state === 'HALF_OPEN') {
      model.trials.push(serviceUp);
      probeResults = [...model.trials];
      $('result').innerHTML = serviceUp
        ? 'Lời gọi thử thành công: nhận dữ liệu sản phẩm.'
        : 'Lời gọi thử thất bại. Fallback: <code>RetryableException</code>.';
      if (model.trials.length === 3) {
        if (model.trials.filter(success => !success).length / 3 >= 0.5) {
          open();
          $('result').innerHTML += ' Ba lượt thử xong: tỉ lệ lỗi ≥ 50%, mạch OPEN trở lại.';
        } else {
          model = fresh();
          $('result').innerHTML += ' Ba lượt thử xong: tỉ lệ lỗi dưới 50%, mạch CLOSED và cửa sổ được đặt lại.';
        }
      }
    } else {
      model.calls.push(serviceUp);
      if (model.calls.length > 5) model.calls.shift();
      $('result').innerHTML = serviceUp
        ? 'Request đi qua mạch: nhận dữ liệu sản phẩm thật.'
        : 'Kết nối product-service thất bại. Fallback: <code>RetryableException</code>.';
      if (model.calls.length === 5 && model.calls.filter(success => !success).length / 5 >= 0.5) {
        open();
        $('result').innerHTML += ' Đủ 5 lời gọi và tỉ lệ lỗi ≥ 50%: mạch chuyển OPEN.';
      }
    }
    render();
  }

  $('send').onclick = send;
  $('service').onclick = () => { serviceUp = !serviceUp; render(); };
  $('reset').onclick = () => {
    model = fresh();
    serviceUp = true;
    probeResults = [];
    window.sorterMachine.reset();
    $('result').textContent = 'Đã đặt lại mạch và bật product-service.';
    render();
  };
  setInterval(() => { if (model.state === 'OPEN' && !document.hidden) render(); }, 250);
  render();
})();
