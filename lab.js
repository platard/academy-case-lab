const tasks = [
  {title: 'Which statement can you support?', options: ['The same person controls A and C.', 'B sent 4,750 units to C 17 minutes after receiving funds.', 'The transfer proves B participated in a scam.'], correct: 1, hints: ['The record identifies wallets. It contains no evidence of shared ownership.', 'Correct. Both the amount and the time interval can be checked against the record.', 'Timing alone cannot establish intent. Look for a claim supported by the two entries.']},
  {title: 'What would you check next?', options: ['Verify the source, date, and basis of the label on A.', 'Record B as a confirmed scam wallet.', 'Close the review because the two amounts differ.'], correct: 0, hints: ['Correct. Checking the underlying source helps the reviewer decide how much weight to give the label.', 'The label concerns A and has yet to be verified.', 'The difference in amounts does not resolve the source question.']}
];
const get = id => document.getElementById(id);
let stage = 0, misses = 0, firstPass = 0, note = '';
function render() {
  const controls = get('controls');
  controls.replaceChildren();
  get('feedback').textContent = '';
  get('next').hidden = true;
  get('step').textContent = stage < 3 ? 'STEP ' + (stage + 1) + ' OF 3' : 'DEBRIEF';
  get('prompt').textContent = tasks[stage]?.title || (stage === 2 ? 'Write your handoff note' : 'Review your reasoning');
  if (stage < 2) {
    const task = tasks[stage];
    task.options.forEach((label, index) => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.textContent = label;
      controls.append(button);
      button.onclick = () => {
        get('feedback').textContent = task.hints[index];
        if (index !== task.correct) { misses++; return; }
        if (!misses) firstPass++;
        controls.querySelectorAll('button').forEach(item => item.disabled = true);
        get('next').hidden = false;
      };
    });
  } else if (stage === 2) {
    controls.innerHTML = '<label for="note">Include one observed fact, one uncertainty, and one next step.</label><textarea id="note" maxlength="1500"></textarea>';
    get('next').textContent = 'Compare with a model note';
    get('next').hidden = false;
  } else {
    controls.innerHTML = '<p><b>First-attempt decisions</b> <span id="score"></span> of 2</p><h3>Your handoff</h3><pre id="copy"></pre><h3>Model handoff</h3><p>B received 4,800 units from A and sent 4,750 to C 17 minutes later. The label on A is unverified, and wallet ownership is unknown. Check the original report and its date before relying on the label.</p><p>Compare your note with the model. Could a colleague identify the transaction, the evidence gap, and the next check?</p>';
    get('copy').textContent = note;
    get('score').textContent = firstPass;
    get('next').textContent = 'Practice again';
    get('next').hidden = false;
  }
}
get('next').onclick = () => {
  if (stage === 2) {
    note = get('note').value.trim();
    if (!note) { get('feedback').textContent = 'Enter a handoff note to compare it with the model.'; get('note').focus(); return; }
  }
  stage++;
  if (stage > 3) { stage = 0; firstPass = 0; note = ''; get('next').textContent = 'Continue'; }
  misses = 0;
  render();
  get('prompt').focus();
};
render();
