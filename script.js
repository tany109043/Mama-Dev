// JavaScript Bookmarklet - Udemy AI Analyzer
(function() {
  if (document.getElementById('udemyAnalyzerBtn')) return;

  // Create floating button
  const btn = document.createElement('button');
  btn.id = 'udemyAnalyzerBtn';
  btn.textContent = '📘';
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#4CAF50;color:white;border:none;border-radius:50%;width:60px;height:60px;font-size:28px;font-weight:bold;cursor:move;z-index:9999;box-shadow:0 4px 10px rgba(0,0,0,0.3);';

  // Create panel
  const panel = document.createElement('div');
  panel.id = 'udemyAnalysisPanel';
  panel.style.cssText = 'display:none;position:fixed;bottom:90px;right:20px;width:350px;height:600px;padding:15px;background:white;color:black;border:1px solid #ccc;border-radius:10px;box-shadow:0 4px 10px rgba(0,0,0,0.3);overflow:auto;z-index:9999;font-family:sans-serif;font-size:14px;line-height:1.4;white-space:pre-wrap;';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '❌';
  closeBtn.style.cssText = 'position:absolute;top:8px;right:10px;background:none;border:none;font-size:16px;cursor:pointer;';
  closeBtn.onclick = function() { panel.style.display = 'none'; };
  panel.appendChild(closeBtn);
  document.body.appendChild(panel);

  // Drag logic
  let moved = false;
  btn.onmousedown = function(e) {
    moved = false;
    e.preventDefault();
    const sx = e.clientX - btn.getBoundingClientRect().left;
    const sy = e.clientY - btn.getBoundingClientRect().top;
    function mm(e) {
      moved = true;
      btn.style.left = e.pageX - sx + 'px';
      btn.style.top = e.pageY - sy + 'px';
      btn.style.bottom = 'auto';
      btn.style.right = 'auto';
      panel.style.left = parseInt(btn.style.left) + 'px';
      panel.style.top = parseInt(btn.style.top) - 630 + 'px';
    }
    document.addEventListener('mousemove', mm);
    btn.onmouseup = function() {
      document.removeEventListener('mousemove', mm);
      btn.onmouseup = null;
    };
  };
  btn.ondragstart = function() { return false; };

  // Click to analyze
  btn.onclick = async function() {
    if (moved) return;
    moved = false;
    if (!location.hostname.includes('udemy.com')) {
      alert('⚠️ Use this on a Udemy course page onlyyyyy.');
      return;
    }

    const url = location.href;
    const title = document.querySelector('h1')?.innerText || 'Untitled Course';
    const apiKey = '7GrQegbiDjSlLZBBVp5xXTEJ3dxCuW8hAxoshU1D';
    const endpoint = 'https://api.cohere.ai/v1/generate';
    const prompt = `You are an educational analyst. Analyze the following Udemy course and provide a detailed breakdown in the following structure:\n\nCourse Title: ${title}\nCourse Link: ${url}\n\nAnswer in this format:\n1. Modules Covered:\n2. Disadvantages of This Course:\n3. Learning Outcomes (explain in detail what skills the learner will gain, how they can apply them, and what they can do after completing this course):`;
    const payload = {
      model: 'command-r-plus',
      prompt,
      max_tokens: 500,
      temperature: 0.6
    };

    panel.style.display = 'block';
    panel.innerHTML = '<b>⏳ Analyzing course...</b>';
    panel.appendChild(closeBtn);

    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const d = await r.json();
      const text = d.generations?.[0]?.text?.trim() || '⚠️ No response';
      panel.innerHTML = '<b>📘 Course Analysis:</b><br><br>' + text.replace(/\n/g, '<br>');
      panel.appendChild(closeBtn);

      // Text input
      const input = document.createElement('textarea');
      input.placeholder = 'Ask anything...';
      input.style.cssText = 'width:100%;height:60px;margin-top:10px;border-radius:5px;border:1px solid #ccc;padding:5px;font-family:sans-serif;font-size:13px;resize:vertical;';
      const askBtn = document.createElement('button');
      askBtn.textContent = 'Ask';
      askBtn.style.cssText = 'margin-top:8px;padding:6px 12px;border:none;background:#007BFF;color:white;border-radius:4px;cursor:pointer;float:right;';
      const reply = document.createElement('div');
      reply.style.cssText = 'clear:both;margin-top:15px;';
      askBtn.onclick = async () => {
        if (!input.value.trim()) return;
        reply.innerHTML = '⏳ Thinking...';
        panel.appendChild(reply);
        const customPrompt = input.value;
        const customPayload = {
          model: 'command-r-plus',
          prompt: customPrompt,
          max_tokens: 400,
          temperature: 0.7
        };
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(customPayload)
          });
          const rd = await res.json();
          reply.innerHTML = '<b>💬 Response:</b><br>' + rd.generations?.[0]?.text?.replace(/\n/g, '<br>') || '⚠️ No response';
        } catch (err) {
          reply.innerHTML = '❌ Error. See console.';
          console.error(err);
        }
      };
      panel.appendChild(input);
      panel.appendChild(askBtn);
      panel.appendChild(reply);

      // Module button
      const modBtn = document.createElement('button');
      modBtn.textContent = '📋 Modules';
      modBtn.style.cssText = 'margin-top:10px;padding:6px 12px;border:none;background:#6c757d;color:white;border-radius:4px;cursor:pointer;float:left;';
      panel.appendChild(modBtn);
      const modulesContainer = document.createElement('div');
      modulesContainer.style.cssText = 'margin-top:15px;clear:both;';
      modBtn.onclick = function() {
        modulesContainer.innerHTML = '<b>📂 Course Modules</b><br><br>';
        const modules = [...document.querySelectorAll(".section--section-title--8blTh")];
        if (modules.length === 0) {
          modulesContainer.innerHTML += '❌ Could not find modules.';
          return;
        }
        modules.forEach((mod, i) => {
          const title = mod.innerText.trim();
          const durEl = mod.parentElement?.querySelector('.section--section-content-summary--1tLrL');
          const duration = durEl?.innerText || '';
          const key = 'udemyMod-' + i;
          const checked = localStorage.getItem(key) === '1';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = checked;
          cb.onchange = () => { localStorage.setItem(key, cb.checked ? '1' : '0'); };
          const label = document.createElement('label');
          label.style.display = 'block';
          label.style.margin = '5px 0';
          label.appendChild(cb);
          label.appendChild(document.createTextNode(' ' + title + (duration ? ' (' + duration + ')' : '')));
          modulesContainer.appendChild(label);
        });
      };
      panel.appendChild(modulesContainer);
    } catch (e) {
      panel.innerHTML = '❌ Error. See console.';
      panel.appendChild(closeBtn);
      console.error(e);
    }
  };

  document.body.appendChild(btn);
})();
