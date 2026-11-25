const pages = [...document.querySelectorAll('nav a')];
const session = { decisions: 0, retries: 0, research: 'Unattempted', sql: 'Unattempted' };
const samples = {
  'Alex (sample)': { decisions: 2, retries: 0, research: 'Needs revision', sql: 'Passed' },
  'Sam (sample)': { decisions: 2, retries: 1, research: 'Verified', sql: 'Needs revision' },
  'Robin (sample)': { decisions: 2, retries: 0, research: 'Verified', sql: 'Passed' }
};
function route() {
  const selected = pages.find(a => a.hash === location.hash) || pages[0];
  pages.forEach(a => {
    document.querySelector(a.hash).hidden = a !== selected;
    if (a === selected) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  dashboard();
}
window.addEventListener('case-choice', e => { if (e.detail) session.decisions++; else session.retries++; });
get('checkSource').onclick = () => {
  const value = get('citation').value;
  if (!value) { get('sourceResult').textContent = 'Choose a record first.'; return; }
  session.research = value === 'R1' ? 'Verified' : 'Needs revision';
  get('sourceResult').textContent = {R1:'Correct. R1 directly records the transfer and amount.',R2:'R2 flags a wallet. Which record directly measures the amount?',R3:'R3 interprets an earlier record. Follow its citation to the original observation.'}[value];
};
let lastCheck = 'No query run yet.';
get('run').onclick = () => {
  const worker = new Worker('query-worker.js');
  const button = get('run');
  button.disabled = true;
  get('result').textContent = 'Checking two datasets…';
  function finish(message, passed) {
    clearTimeout(timer);
    worker.terminate();
    button.disabled = false;
    lastCheck = message;
    session.sql = passed ? 'Passed' : 'Needs revision';
    get('result').textContent = message;
  }
  const timer = setTimeout(() => finish('Query timed out. Try a simpler SELECT.', false), 10000);
  worker.onerror = () => finish('SQL engine could not start. Reload the published site and retry.', false);
  worker.onmessage = ({data}) => finish(data.error || ('Case result: ' + data.actual + '. ' + (data.passed ? 'Both datasets passed.' : 'Check the direction and make sure your total handles a second outgoing transfer.')), data.passed);
  worker.postMessage(get('sql').value);
};
const caseFacts = 'Fictional case. R1: A sent B 4800 at 09:12; B sent C 4750 at 09:29 UTC. R2 is an unverified report about A. R3 is a memo citing R1. Ownership is unknown. SQL table transfers(sender, recipient, units). Goal: total units sent by B.';
let engine, busy = false;
get('enable').onclick = async () => {
  const button = get('enable');
  button.disabled = true;
  try {
    if (!navigator.gpu || !await navigator.gpu.requestAdapter()) throw Error('WebGPU is unavailable in this browser.');
    const mlc = await import('https://esm.run/@mlc-ai/web-llm@0.2.80');
    const model = mlc.prebuiltAppConfig.model_list.find(m => m.model_id.startsWith('Qwen2.5-0.5B-Instruct-q4f32'));
    if (!model) throw Error('Model unavailable.');
    engine = await mlc.CreateMLCEngine(model.model_id, {initProgressCallback: p => get('model').textContent = p.text}, {context_window_size:2048});
    get('model').textContent = 'Local AI ready: ' + model.model_id;
  } catch (e) {
    get('model').textContent = 'Local AI could not start. ' + e.message + ' Guided hints are available.';
    button.disabled = false;
  }
};
async function advice(instruction, input, fallback) {
  if (!engine) return 'Guided hint · ' + fallback;
  if (busy) return 'The local model is answering another question. Try again shortly.';
  busy = true;
  try {
    const response = await engine.chat.completions.create({messages:[
      {role:'system',content: caseFacts + ' ' + instruction + ' Use only the supplied evidence. Give one concise suggestion and a follow-up question.'},
      {role:'user',content:input.slice(-2500)}
    ],max_tokens:150,temperature:0.3});
    const answer = response.choices[0]?.message?.content?.trim();
    if (!answer) throw Error('Empty answer');
    return 'Local AI · ' + answer;
  } catch { return 'Model unavailable. Guided hint · ' + fallback; }
  finally { busy = false; }
}
function guided(question) {
  if (/owner|person|identity|control/i.test(question)) return 'R1 identifies wallets. What additional evidence would link a person to one of those wallets?';
  if (/source|label|research|report/i.test(question)) return 'Compare R1 and R2 in the research desk. Which records an event, and which makes a claim that needs verification?';
  if (/sql|query|sender|recipient|code/i.test(question)) return 'Read the arrow B → C from left to right. Which column holds B when it sends units?';
  if (/note|handoff|write/i.test(question)) return 'Write one observed transfer, one uncertainty, and the next check. Can a colleague trace your observation back to R1?';
  return 'Start with one claim about the case. Is it about wallet ownership, a source, SQL, or your handoff note?';
}
const turns = [];
get('chat').onsubmit = async e => {
  e.preventDefault();
  const question = get('question').value.trim();
  if (!question) return;
  const button = e.target.querySelector('button');
  button.disabled = true;
  const message = document.createElement('p');
  message.textContent = 'You · ' + question;
  const answer = document.createElement('p');
  answer.textContent = 'Preparing feedback…';
  get('messages').append(message,answer);
  get('question').value = '';
  answer.textContent = await advice('Coach the learner through the evidence.', [...turns.slice(-2),question].join('\n'), guided(question));
  turns.push(question,answer.textContent);
  button.disabled = false;
};
get('pair').onclick = async () => {
  const query = get('sql').value;
  const fallback = /where\s+recipient/i.test(query) ? 'Your filter selects incoming transfers. Which field identifies who sent each transfer?' : /sum\s*\(/i.test(query) ? 'Trace the filter with an extra B → D transfer of 30 units. Does the total rise by exactly 30?' : 'How could you combine multiple outgoing amounts into one total?';
  get('pairResult').textContent = await advice('Act as a SQL pair programmer. Hint without writing the finished query.',query + '\nLast run: ' + lastCheck,fallback);
};
function dashboard() {
  const name = get('learner').value;
  const data = samples[name] || session;
  get('student').textContent = name;
  get('signals').replaceChildren();
  for (const [label,value] of [['Correct case decisions (all attempts)',data.decisions],['Incorrect case choices',data.retries],['Source citation',data.research],['SQL checks',data.sql]]) {
    const term = document.createElement('dt'), detail = document.createElement('dd');
    term.textContent = label; detail.textContent = value; get('signals').append(term,detail);
  }
  let hint = 'Invite the learner to attempt the remaining activities before drawing conclusions.';
  if (data.research === 'Needs revision') hint = 'Revisit the citation choice together. Ask the learner to point to the original record that contains the transfer amount.';
  else if (data.sql === 'Needs revision') hint = 'Trace one incoming and one outgoing transfer together. Ask which row should contribute to the total.';
  else if (data.retries > 0) hint = 'Revisit one case decision and ask what evidence changed the learner’s answer.';
  else if (data.decisions >= 2 && data.research === 'Verified' && data.sql === 'Passed') hint = 'Offer an extension: ask how a second outgoing transfer changes the SQL result and the written handoff.';
  get('suggestion').textContent = hint;
  get('coachResult').textContent = '';
}
get('learner').onchange = dashboard;
get('coach').onclick = async () => {
  const name = get('learner').value;
  const data = samples[name] || session;
  const response = await advice('Coach an instructor using only these activity counts and check results. Avoid inferring motivation or ability.', JSON.stringify(data),get('suggestion').textContent);
  if (name === get('learner').value) get('coachResult').textContent = response;
};
window.addEventListener('hashchange',route);
route();
