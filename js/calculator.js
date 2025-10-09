/* Firebase Config - Using compat SDK loaded in HTML */
// Firebase is already initialized via the HTML script tags
// No need to initialize again, just get references
const db = firebase.database();
const auth = firebase.auth();
const printersRef  = db.ref('printers');
const filamentsRef = db.ref('filaments');

// Calculator State
let currentValue = '0';
let previousValue = '';
let operator = null;
let shouldResetDisplay = false;

// DOM Elements
const currentDisplay = document.getElementById('currentDisplay');
const previousDisplay = document.getElementById('previousDisplay');
const historyList = document.getElementById('historyList');
const historyToggle = document.getElementById('historyToggle');
const historyPanel = document.getElementById('historyPanel');
const printTime = $('#printTime');
const printTimeDuplicate = $('#printTimeDuplicate');

/* Helpers */
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
function money(n){ return `$${(Math.round(n*100)/100).toFixed(2)}`; }

/* Tabs */
$$('.tab').forEach(b=>{
  b.addEventListener('click', ()=>{
    $$('.tab').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const id = b.dataset.tab;
    ['calculator','printers','filaments'].forEach(t=>{
      const s = document.getElementById(t);
      s.style.display = (t===id)?'block':'none';
    });
  });
});

/* Login Modal */
const overlay = $('#overlay'), modal = $('#modal');
const btnLogin = $('#btnLogin');
btnLogin.onclick = ()=>{
  $('#loginErr').textContent = '';
  overlay.style.display='block'; modal.style.display='grid';
};
$('#doClose').onclick = ()=>{ overlay.style.display='none'; modal.style.display='none'; };

$('#doLogin').onclick = ()=>{
  const email = $('#loginEmail').value.trim();
  const pass  = $('#loginPass').value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(()=>{ overlay.style.display='none'; modal.style.display='none'; })
    .catch(()=>{ $('#loginErr').textContent='Wrong email or password.'; });
};

auth.onAuthStateChanged(user=>{
  btnLogin.textContent = user ? 'Logout' : 'Login';
  btnLogin.onclick = user
    ? ()=>auth.signOut()
    : ()=>{ $('#loginErr').textContent=''; overlay.style.display='block'; modal.style.display='grid'; };
  refreshPrintersUI();
  refreshFilamentsUI();
});

/* Printers & Filaments UI */
const selPrinter  = $('#printer');
const selFilament = $('#filament');

function refreshPrintersUI(){
  printersRef.once('value', snap=>{
    const arr = Object.values(snap.val()||{});
    const tbody = $('#printerTable'); tbody.innerHTML='';
    const isAdmin = !!auth.currentUser;
    arr.forEach(p=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>$${Number(p.costPerHour||0).toFixed(3)}</td>
        <td>${isAdmin?`<button class="btn soft" data-del="${p.name}">Delete</button>`:''}</td>`;
      tbody.appendChild(tr);
    });
    selPrinter.innerHTML='';
    arr.forEach(p=>{
      const opt = new Option(`${p.name} ($${Number(p.costPerHour).toFixed(3)}/h)`, p.name);
      selPrinter.add(opt);
    });
    if(isAdmin){
      $$('#printerTable [data-del]').forEach(btn=>{
        btn.onclick = ()=>{
          const name = btn.getAttribute('data-del');
          printersRef.orderByChild('name').equalTo(name).once('value', s=>{
            s.forEach(ch=>ch.ref.remove());
            refreshPrintersUI();
          });
        };
      });
    }
  });
}

function refreshFilamentsUI(){
  filamentsRef.once('value', snap=>{
    const arr = Object.values(snap.val()||{});
    const tbody = $('#filamentTable'); tbody.innerHTML='';
    const isAdmin = !!auth.currentUser;
    arr.forEach(f=>{
      const tr = document.createElement('tr');
      const perKg = (Number(f.costPerG||0)*1000).toFixed(2);
      tr.innerHTML = `
        <td>${f.type}</td>
        <td>${f.brand}</td>
        <td>$${perKg}</td>
        <td>${isAdmin?`<button class="btn soft" data-del="${f.type}">Delete</button>`:''}</td>`;
      tbody.appendChild(tr);
    });
    selFilament.innerHTML='';
    arr.forEach(f=>{
      const perKg = (Number(f.costPerG)*1000).toFixed(2);
      selFilament.add(new Option(`${f.type} (${f.brand}) ($${perKg}/kg)`, f.type));
    });
    if(isAdmin){
      $$('#filamentTable [data-del]').forEach(btn=>{
        btn.onclick = ()=>{
          const type = btn.getAttribute('data-del');
          filamentsRef.orderByChild('type').equalTo(type).once('value', s=>{
            s.forEach(ch=>ch.ref.remove());
            refreshFilamentsUI();
          });
        };
      });
    }
  });
}

printersRef.on('value', refreshPrintersUI);
filamentsRef.on('value', refreshFilamentsUI);

/* Add Forms */
$('#formAddPrinter').addEventListener('submit', e=>{
  e.preventDefault();
  if(!auth.currentUser) return alert('Login required.');
  const name = $('#newPrinterName').value.trim();
  const cost = parseFloat($('#newPrinterCost').value);
  if(!name || !isFinite(cost)) return;
  printersRef.push({ name, costPerHour: cost });
  e.target.reset();
});

$('#formAddFilament').addEventListener('submit', e=>{
  e.preventDefault();
  if(!auth.currentUser) return alert('Login required.');
  const type = $('#newFilamentType').value.trim();
  const brand = $('#newFilamentBrand').value.trim();
  const spool = parseFloat($('#newFilamentCost').value);
  if(!type || !brand || !isFinite(spool)) return;
  const costPerG = spool / 1000;
  filamentsRef.push({ type, brand, costPerG });
  e.target.reset();
});

/* Calculator */
printTime.addEventListener('input', ()=>{ printTimeDuplicate.value = printTime.value || 0; });

const LS = 'calc.v1';
function savePrefs(){ localStorage.setItem(LS, JSON.stringify({ p: selPrinter.value, f: selFilament.value })); }
function loadPrefs(){
  try{
    const {p,f} = JSON.parse(localStorage.getItem(LS)||'{}');
    if(p) selPrinter.value = p;
    if(f) selFilament.value = f;
  }catch{}
}
selPrinter.addEventListener('change', savePrefs);
selFilament.addEventListener('change', savePrefs);

$('#btnCalc').addEventListener('click', ()=>{
  const printerName  = selPrinter.value;
  const filamentType = selFilament.value;
  if(!printerName || !filamentType) return alert('Select a printer and filament.');

  printersRef.orderByChild('name').equalTo(printerName).once('value', snap=>{
    if(!snap.val()) return alert('Printer not found.');
    const p = Object.values(snap.val())[0];

    filamentsRef.orderByChild('type').equalTo(filamentType).once('value', snap2=>{
      if(!snap2.val()) return alert('Filament not found.');
      const f = Object.values(snap2.val())[0];

      const pt = +printTime.value || 0;
      const w  = (+$('#weight').value || 0)/1000;
      const electricityPrice = +$('#elec').value || 0.12;
      const electricityUsagePerHour = 0.1;
      const costElectric = pt * electricityUsagePerHour * electricityPrice;

      const jr = (+$('#jobRemoval').value||0)/60;
      const sr = (+$('#supportRemoval').value||0)/60;
      const aw = (+$('#additionalWork').value||0)/60;
      const mp = (+$('#modelPrep').value||0)/60;
      const sl = (+$('#slicing').value||0)/60;
      const mc = (+$('#materialChange').value||0)/60;
      const ts = (+$('#transferStart').value||0)/60;
      const totalHandTime = jr+sr+aw+mp+sl+mc+ts;

      const fm = +$('#filamentMarkup').value || 1;
      const gm = (+$('#generalMarkup').value||0)/100;
      const fr = (+$('#failureRate').value||0)/100;

      const costPrinter  = Number(p.costPerHour||0) * pt;
      const costFilament = Number(f.costPerG||0) * (w*1000) * fm;
      const subtotal     = costPrinter + costFilament + costElectric;

      const subtotalWithMarkup = subtotal * (1 + gm);
      const finalPrice = subtotalWithMarkup / (1 - fr);

      const r = $('#results');
      r.innerHTML = `
        <p>Printer Depreciation: <b>${money(costPrinter)}</b></p>
        <p>Filament: <b>${money(costFilament)}</b>  <span class="note">(${(w*1000).toFixed(0)} g @ $${(Number(f.costPerG)||0).toFixed(3)}/g × ${fm.toFixed(2)})</span></p>
        <p>Electricity: <b>${money(costElectric)}</b>  <span class="note">(${electricityUsagePerHour} kWh/h)</span></p>
        <hr style="border:none;border-top:1px solid var(--line);margin:10px 0">
        <p>Subtotal (before markup): <b>${money(subtotal)}</b></p>
        <p>+ General Markup (${(gm*100).toFixed(0)}%)</p>
        <p>+ Failure Rate (${(fr*100).toFixed(0)}%)</p>
        <hr style="border:none;border-top:1px solid var(--line);margin:10px 0">
        <p style="font-size:18px"><strong>Total Price: ${money(finalPrice)}</strong></p>
        <p class="note">Unbilled hand time recorded: ${totalHandTime.toFixed(2)} h (set a labour $/h to include it later).</p>
      `;
      savePrefs();
    });
  });
});

printTimeDuplicate.value = printTime.value || 0;
loadPrefs();

// Calculator Functions
function updateDisplay() {
    currentDisplay.textContent = currentValue;
    if (operator && previousValue) {
        previousDisplay.textContent = `${previousValue} ${operator}`;
    } else {
        previousDisplay.textContent = '';
    }
}

function appendNumber(number) {
    if (shouldResetDisplay) {
        currentValue = number;
        shouldResetDisplay = false;
    } else {
        if (number === '.' && currentValue.includes('.')) return;
        currentValue = currentValue === '0' ? number : currentValue + number;
    }
    updateDisplay();
}

function setOperator(op) {
    if (operator !== null && !shouldResetDisplay) {
        calculate();
    }
    operator = op;
    previousValue = currentValue;
    shouldResetDisplay = true;
    updateDisplay();
}

function calculate() {
    if (operator === null || shouldResetDisplay) return;

    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);
    let result;

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '×':
            result = prev * current;
            break;
        case '÷':
            result = current !== 0 ? prev / current : 'Error';
            break;
        default:
            return;
    }

    if (result !== 'Error') {
        result = Math.round(result * 100000000) / 100000000;
        saveToHistory(`${previousValue} ${operator} ${currentValue}`, result);
    }

    currentValue = result.toString();
    operator = null;
    previousValue = '';
    shouldResetDisplay = true;
    updateDisplay();
}

function percentage() {
    currentValue = (parseFloat(currentValue) / 100).toString();
    updateDisplay();
}

function clearAll() {
    currentValue = '0';
    previousValue = '';
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function deleteLast() {
    if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);
    } else {
        currentValue = '0';
    }
    updateDisplay();
}

// Firebase History Functions
function saveToHistory(calculation, result) {
    const historyRef = ref(database, 'calculatorHistory');
    const newHistoryRef = push(historyRef);
    
    set(newHistoryRef, {
        calculation: calculation,
        result: result,
        timestamp: Date.now()
    });
}

function loadHistory() {
    const historyRef = ref(database, 'calculatorHistory');
    
    onValue(historyRef, (snapshot) => {
        historyList.innerHTML = '';
        const data = snapshot.val();
        
        if (!data) {
            historyList.innerHTML = '<p class="history-empty">No calculations yet</p>';
            return;
        }

        const historyArray = Object.entries(data)
            .map(([key, value]) => ({ key, ...value }))
            .sort((a, b) => b.timestamp - a.timestamp);

        historyArray.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.onclick = () => {
                currentValue = item.result.toString();
                updateDisplay();
            };
            
            historyItem.innerHTML = `
                <div class="history-calculation">${item.calculation}</div>
                <div class="history-result">= ${item.result}</div>
            `;
            
            historyList.appendChild(historyItem);
        });
    });
}

function clearHistory() {
    if (confirm('Clear all history?')) {
        const historyRef = ref(database, 'calculatorHistory');
        remove(historyRef);
    }
}

// History Panel Toggle
function setupHistoryToggle() {
    historyToggle.addEventListener('click', () => {
        historyPanel.classList.toggle('hidden');
    });
}

// Keyboard Support
function setupKeyboardSupport() {
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9' || e.key === '.') {
            appendNumber(e.key);
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            const opMap = { '*': '×', '/': '÷' };
            setOperator(opMap[e.key] || e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            calculate();
        } else if (e.key === 'Escape') {
            clearAll();
        } else if (e.key === 'Backspace') {
            deleteLast();
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    setupKeyboardSupport();
    setupHistoryToggle();
});

// Make functions globally available
window.appendNumber = appendNumber;
window.setOperator = setOperator;
window.calculate = calculate;
window.percentage = percentage;
window.clearAll = clearAll;
window.deleteLast = deleteLast;
window.clearHistory = clearHistory;
window.goHome = () => window.location.href = '../index.html';
