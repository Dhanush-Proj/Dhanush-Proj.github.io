(function () {
  'use strict';

  var USERNAME = 'Dhanush-Proj';
  var canvas = document.getElementById('contribution-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var tooltip = document.getElementById('tooltip');

  var MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var DOW = ['S','M','T','W','T','F','S'];
  var BAR_W = 18, BAR_GAP = 5, MAX_H = 100;
  var COLORS = ['#ffffff', '#d4e8ff', '#80d0ff', '#2a9aff', '#0055cc'];
  var CAL_CELL = 18, CAL_GAP = 2;

  var grid = [], totalCount = 0;
  var currentYear = new Date().getFullYear();
  var currentView = 'year';
  var monthKeys = [];
  var cellHitmap = [];
  var hoveredDay = null;
  var repoCache = {};
  var activeMonthKey = null;
  var yearCanvasW = 300, yearCanvasH = 160;

  var yearLabel = document.getElementById('year-label');
  var yearPrev = document.getElementById('year-prev');
  var yearNext = document.getElementById('year-next');
  var yearSelector = document.getElementById('year-selector');
  var monthHeader = document.getElementById('month-header');
  var monthLabel = document.getElementById('month-label');
  var monthBack = document.getElementById('month-back');

  yearPrev.addEventListener('click', function () { loadYear(currentYear - 1); });
  yearNext.addEventListener('click', function () { loadYear(currentYear + 1); });
  monthBack.addEventListener('click', function () { showYearView(); });
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('mousemove', onCanvasMove);
  canvas.addEventListener('mouseleave', function () { hideTooltip(); });

  loadYear(currentYear);

  function loadYear(year) {
    currentYear = year;
    var from = year + '-01-01';
    var to = year + '-12-31';

    fetch('https://github-contributions-api.deno.dev/' + USERNAME + '.json?from=' + from + '&to=' + to)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        grid = data.contributions || [];
        totalCount = data.totalContributions || 0;
        yearLabel.textContent = year;
        if (!grid.length || !totalCount) { renderEmpty(); return; }
        currentView = 'year';
        yearSelector.style.display = '';
        monthHeader.style.display = 'none';
        renderYear();
      })
      .catch(function () { renderError(); });
  }

  function showYearView() {
    currentView = 'year';
    yearSelector.style.display = '';
    monthHeader.style.display = 'none';
    hideTooltip();
    renderYear();
  }

  function showMonthView(monthKey) {
    currentView = 'month';
    activeMonthKey = monthKey;
    yearSelector.style.display = 'none';
    monthHeader.style.display = '';

    var parts = monthKey.split('-');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    monthLabel.textContent = MONTHS[m - 1] + ' ' + y;

    if (!repoCache[monthKey]) {
      fetchReposForMonth(monthKey);
    }

    renderMonth(monthKey);
  }

  function fetchReposForMonth(monthKey) {
    var searchUrl = 'https://api.github.com/search/commits?q=author:' + USERNAME + '+author-date:' + monthKey + '&per_page=100&sort=author-date';

    fetch(searchUrl, { headers: { 'Accept': 'application/vnd.github.cloak-preview' } })
      .then(function (r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      })
      .then(function (data) {
        var byDate = {};
        if (data.items) {
          for (var i = 0; i < data.items.length; i++) {
            var item = data.items[i];
            var dateStr = (item.commit.author.date || item.commit.committer.date).slice(0, 10);
            var repoName = item.repository.full_name;
            if (!byDate[dateStr]) byDate[dateStr] = {};
            byDate[dateStr][repoName] = (byDate[dateStr][repoName] || 0) + 1;
          }
        }
        repoCache[monthKey] = byDate;
        if (currentView === 'month' && activeMonthKey === monthKey && hoveredDay) {
          updateTooltipContent(hoveredDay);
        }
      })
      .catch(function () { repoCache[monthKey] = {}; });
  }

  function onCanvasClick(e) {
    var pos = getCanvasPos(e);
    if (!pos) return;
    var mx = pos.x, my = pos.y;

    if (currentView === 'year') {
      var pad = 20;
      for (var i = 0; i < monthKeys.length; i++) {
        var bx = pad + i * (BAR_W + BAR_GAP);
        if (mx >= bx && mx <= bx + BAR_W) {
          showMonthView(monthKeys[i]);
          return;
        }
      }
    }
  }

  function onCanvasMove(e) {
    var pos = getCanvasPos(e);
    if (!pos) return;

    if (currentView === 'month') {
      for (var i = 0; i < cellHitmap.length; i++) {
        var cell = cellHitmap[i];
        if (pos.x >= cell.x && pos.x <= cell.x + CAL_CELL &&
            pos.y >= cell.y && pos.y <= cell.y + CAL_CELL) {
          hoveredDay = cell.dateStr;
          updateTooltipContent(cell.dateStr);
          showTooltipAt(e.clientX, e.clientY);
          return;
        }
      }
      hideTooltip();
      hoveredDay = null;
    }
  }

  function getCanvasPos(e) {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function updateTooltipContent(dateStr) {
    var count = 0;
    for (var c = 0; c < grid.length; c++) {
      for (var r = 0; r < 7; r++) {
        var day = grid[c] && grid[c][r];
        if (day && day.date === dateStr) {
          count = day.contributionCount || 0;
          break;
        }
      }
      if (count > 0) break;
    }

    var parts = dateStr.split('-');
    var displayDate = MONTHS[parseInt(parts[1], 10) - 1] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
    var html = '<div>' + displayDate + '</div>';
    html += '<div>' + count + ' contribution' + (count !== 1 ? 's' : '') + '</div>';

    var monthKey = dateStr.slice(0, 7);
    var repos = repoCache[monthKey];
    if (repos && repos[dateStr]) {
      html += '<div style="border-top:1px solid #8080b0;margin:4px 0 2px 0"></div>';
      var repoList = Object.keys(repos[dateStr]);
      for (var i = 0; i < repoList.length && i < 5; i++) {
        var shortName = repoList[i].replace(USERNAME + '/', '');
        html += '<div>' + shortName + ' <span style="color:#8080b0">x' + repos[dateStr][repoList[i]] + '</span></div>';
      }
      if (repoList.length > 5) {
        html += '<div style="color:#8080b0">+' + (repoList.length - 5) + ' more</div>';
      }
    }

    tooltip.innerHTML = html;
  }

  function showTooltipAt(cx, cy) {
    tooltip.style.display = 'block';
    var tw = tooltip.offsetWidth;
    var th = tooltip.offsetHeight;
    var tx = cx - tw / 2;
    var ty = cy - th - 5;
    if (tx < 4) tx = 4;
    if (tx + tw > window.innerWidth - 4) tx = window.innerWidth - tw - 4;
    if (ty < 4) ty = 4;
    if (ty + th > window.innerHeight - 4) ty = window.innerHeight - th - 4;
    tooltip.style.left = tx + 'px';
    tooltip.style.top = ty + 'px';
  }

  function hideTooltip() {
    tooltip.style.display = 'none';
    hoveredDay = null;
  }

  function renderYear() {
    var monthly = {};
    for (var c = 0; c < grid.length; c++) {
      for (var r = 0; r < 7; r++) {
        var day = grid[c] && grid[c][r];
        if (!day || !day.date) continue;
        var key = day.date.slice(0, 7);
        monthly[key] = (monthly[key] || 0) + (day.contributionCount || 0);
      }
    }

    var keys = Object.keys(monthly).sort();
    monthKeys = keys;
    var vals = keys.map(function (k) { return monthly[k]; });
    var maxVal = Math.max.apply(null, vals) || 1;

    var pad = 20;
    var labelH = 18;
    var legendH = 16;
    var baseH = MAX_H + 4;

    var W = pad * 2 + keys.length * (BAR_W + BAR_GAP) - BAR_GAP;
    var H = pad + baseH + labelH + legendH + 10;

    canvas.width = W;
    canvas.height = H;
    canvas.style.aspectRatio = W + ' / ' + H;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    yearCanvasW = W;
    yearCanvasH = H;

    var baselineY = pad + MAX_H + 2;

    for (var i = 0; i < keys.length; i++) {
      var barH = Math.round((vals[i] / maxVal) * MAX_H);
      if (barH < 2 && vals[i] > 0) barH = 2;

      var bx = pad + i * (BAR_W + BAR_GAP);
      var by = baselineY - barH;

      var steps = Math.ceil(barH / 4);
      for (var s = 0; s < steps; s++) {
        var sh = Math.min(4, barH - s * 4);
        var colorIdx = Math.min(Math.floor((s / steps) * 4), 3);
        ctx.fillStyle = COLORS[colorIdx + 1];
        ctx.fillRect(bx, by + s * 4, BAR_W - 3, sh);
      }

      ctx.fillStyle = '#1f7aaa';
      ctx.fillRect(bx + BAR_W - 3, by, 3, barH);

      var monthNum = parseInt(keys[i].slice(5, 7), 10);
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#8080b0';
      ctx.fillText(MONTHS[monthNum - 1], bx + BAR_W / 2, baselineY + 4);
    }

    var legendY = pad + baseH + labelH + 4;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#8080b0';
    ctx.fillText('Less', pad, legendY);
    for (var i = 0; i < 5; i++) {
      ctx.fillStyle = COLORS[i];
      ctx.fillRect(pad + 34 + i * 12, legendY, 8, 8);
    }
    ctx.fillStyle = '#8080b0';
    ctx.fillText('More', pad + 34 + 5 * 12 + 4, legendY);
    ctx.textAlign = 'right';
    ctx.fillText('Total: ' + totalCount, W - pad, legendY);
  }

  function renderMonth(monthKey) {
    var parts = monthKey.split('-');
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);

    var daysInMonth = new Date(year, month, 0).getDate();
    var firstDOW = new Date(year, month - 1, 1).getDay();
    var totalDays = daysInMonth + firstDOW;
    var rows = Math.ceil(totalDays / 7);

    var dayData = {};
    for (var c = 0; c < grid.length; c++) {
      for (var r = 0; r < 7; r++) {
        var day = grid[c] && grid[c][r];
        if (!day || !day.date) continue;
        if (day.date.slice(0, 7) === monthKey) {
          dayData[day.date] = day.contributionCount || 0;
        }
      }
    }

    var CELL = CAL_CELL, GAP = CAL_GAP, STEP = CELL + GAP;
    var W = yearCanvasW, H = yearCanvasH;
    var gridW = 7 * STEP - GAP;
    var headerH = 14, dowH = 10;
    var gridH = rows * STEP;
    var padX = (W - gridW) / 2;
    var topPad = (H - headerH - dowH - gridH - 12) / 2;
    if (topPad < 6) topPad = 6;

    canvas.width = W;
    canvas.height = H;
    canvas.style.aspectRatio = W + ' / ' + H;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#8080b0';
    ctx.fillText(MONTHS[month - 1] + ' ' + year, W / 2, topPad + headerH - 2);

    ctx.textBaseline = 'top';
    ctx.font = '5px "Press Start 2P", monospace';
    for (var d = 0; d < 7; d++) {
      ctx.fillStyle = '#8080b0';
      ctx.textAlign = 'center';
      ctx.fillText(DOW[d], padX + d * STEP + CELL / 2, topPad + headerH);
    }

    cellHitmap = [];
    var dayNum = 1;
    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < 7; col++) {
        if (row === 0 && col < firstDOW) continue;
        if (dayNum > daysInMonth) break;

        var dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
        var count = dayData[dateStr] || 0;
        var level = count === 0 ? 0 : (count <= 2 ? 1 : (count <= 5 ? 2 : (count <= 10 ? 3 : 4)));

        var cx = padX + col * STEP;
        var cy = topPad + headerH + dowH + row * STEP;

        ctx.fillStyle = COLORS[level];
        ctx.fillRect(cx, cy, CELL, CELL);

        ctx.fillStyle = level > 1 ? '#ffffff' : (level === 0 ? '#8080b0' : '#383e56');
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dayNum, cx + CELL / 2, cy + CELL / 2);

        cellHitmap.push({ x: cx, y: cy, dateStr: dateStr });
        dayNum++;
      }
    }

    var totalMonth = 0;
    for (var key in dayData) totalMonth += dayData[key];
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#8080b0';
    ctx.fillText('Hover for details', W / 2, topPad + headerH + dowH + rows * STEP + 6);
  }

  function renderEmpty() {
    var W = 300, H = 80;
    canvas.width = W;
    canvas.height = H;
    canvas.style.aspectRatio = W + ' / ' + H;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#8080b0';
    ctx.fillText('No contributions in ' + currentYear, W / 2, H / 2);
  }

  function renderError() {
    var W = 400, H = 100;
    canvas.width = W;
    canvas.height = H;
    canvas.style.aspectRatio = W + ' / ' + H;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('! FAILED TO LOAD', W / 2, H / 2 - 8);
    ctx.fillStyle = '#8080b0';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('Could not fetch contribution data', W / 2, H / 2 + 10);
  }
})();
