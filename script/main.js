// Resume Builder App
// JavaScript functionality

document.addEventListener('DOMContentLoaded', () => {
  initInputs();
  initButtons();
  loadSavedData();
  applyTheme();
  showLastUpdated();
});

const skills = [];
const experiences = [];

function initInputs() {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const summaryInput = document.getElementById('summary');
  const educationInput = document.getElementById('education-input');
  const templateStyle = document.getElementById('template-style');

  nameInput.addEventListener('input', updateResume);
  emailInput.addEventListener('input', updateResume);
  summaryInput.addEventListener('input', updateResume);
  educationInput.addEventListener('input', updateResume);
  templateStyle.addEventListener('change', updateResume);

  nameInput.addEventListener('blur', () => {
    nameInput.style.border = nameInput.value.trim() ? '' : '2px solid red';
  });

  emailInput.addEventListener('blur', () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
    emailInput.style.border = valid ? '' : '2px solid red';
  });
}

function initButtons() {
  document.getElementById('resume-form').addEventListener('submit', (e) => {
    e.preventDefault();
    updateResume();
  });

  document.getElementById('add-skill-btn').addEventListener('click', () => {
    const skillInput = document.getElementById('skill-input');
    const skill = skillInput.value.trim();
    if (skill && !skills.includes(skill)) {
      skills.push(skill);
      skillInput.value = '';
      renderSkillTags();
      updateResume();
    }
  });

  document.getElementById('add-experience-btn').addEventListener('click', () => {
    const textarea = document.createElement('textarea');
    textarea.rows = 3;
    textarea.placeholder = 'Describe your role or experience...';
    textarea.className = 'exp-entry';
    textarea.addEventListener('input', () => {
      const expEntries = Array.from(document.querySelectorAll('.exp-entry'));
      experiences.length = 0;
      expEntries.forEach(entry => experiences.push(entry.value));
      updateResume();
    });
    document.getElementById('experience-list').appendChild(textarea);
  });
  document.getElementById('download-btn').addEventListener('click', () => {
    const preview = document.getElementById('resume-preview');

    if (!preview || preview.innerHTML.trim() === '') {
      alert("Please generate your resume before downloading.");
      return;
    }

    const resumeOutput = document.getElementById('resume-output');
    const originalDisplay = resumeOutput.style.display;
    resumeOutput.style.display = 'block';

    const opt = {
      margin: 0.5,
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(preview)
      .save()
      .then(() => {
        resumeOutput.style.display = originalDisplay;
      });
  });

  document.getElementById('print-btn').addEventListener('click', () => window.print());

  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode'));
  });

  document.getElementById('profile-pic').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const previewPic = document.getElementById('preview-pic');
        previewPic.src = e.target.result;
        previewPic.style.display = 'block';
        updateResume();
      };
      reader.readAsDataURL(file);
    }
  });
}

function renderSkillTags() {
  const skillTags = document.getElementById('skill-tags');
  skillTags.innerHTML = '';
  skills.forEach((skill, i) => {
    const tag = document.createElement('span');
    tag.textContent = skill;
    tag.className = 'skill-tag';
    tag.title = 'Click to remove';
    tag.style.cursor = 'pointer';
    tag.onclick = () => {
      skills.splice(i, 1);
      renderSkillTags();
      updateResume();
    };
    skillTags.appendChild(tag);
  });
}

function updateResume() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const summary = document.getElementById('summary').value.trim();
  const education = document.getElementById('education-input').value.trim();
  const templateStyle = document.getElementById('template-style').value;
  const previewPic = document.getElementById('preview-pic');
  const preview = document.getElementById('resume-preview');

  // Store preview image src and display state
  const profileSrc = previewPic?.src || 'assets/default-profile.png';
  const displayStyle = previewPic?.style.display;

  preview.className = templateStyle;
  preview.innerHTML = '';

  const img = document.createElement('img');
  img.src = profileSrc;
  img.alt = 'Profile Photo';
  img.style = 'width:100px;height:100px;border-radius:50%;margin-bottom:1rem;';
  preview.appendChild(img);

  if (name) preview.innerHTML += `<h2>${name}</h2>`;
  if (email) preview.innerHTML += `<p><strong>Email:</strong> ${email}</p>`;
  if (summary) preview.innerHTML += `<p><strong>Summary:</strong> ${summary}</p>`;
  if (education) preview.innerHTML += `<p><strong>Education:</strong> ${education}</p>`;

  if (skills.length) {
    const skillSpans = skills.map(skill => `<span>${skill}</span>`).join(' ');
    preview.innerHTML += `<p><strong>Skills:</strong> ${skillSpans}</p>`;
  }

  if (experiences.length) {
    const expItems = experiences.map(e => `<li>${e}</li>`).join('');
    preview.innerHTML += `<p><strong>Experience:</strong></p><ul>${expItems}</ul>`;
  }

  previewPic.style.display = displayStyle || 'none';

  document.getElementById('resume-output').style.display = 'block';

  localStorage.setItem('resume-data', JSON.stringify({
    name, email, summary, education, skills, experiences,
    templateStyle,
    profilePic: profileSrc,
    lastUpdated: new Date().toLocaleString()
  }));
}

function loadSavedData() {
  const saved = JSON.parse(localStorage.getItem('resume-data'));
  if (!saved) return;
  document.getElementById('name').value = saved.name || '';
  document.getElementById('email').value = saved.email || '';
  document.getElementById('summary').value = saved.summary || '';
  document.getElementById('education-input').value = saved.education || '';
  document.getElementById('template-style').value = saved.templateStyle || 'classic';

  const previewPic = document.getElementById('preview-pic');
  previewPic.src = saved.profilePic || 'assets/default-profile.png';
  previewPic.style.display = 'block';

  if (Array.isArray(saved.skills)) skills.push(...saved.skills);
  if (Array.isArray(saved.experiences)) {
    saved.experiences.forEach(exp => {
      const textarea = document.createElement('textarea');
      textarea.rows = 3;
      textarea.placeholder = 'Describe your role or experience...';
      textarea.className = 'exp-entry';
      textarea.value = exp;
      textarea.addEventListener('input', () => {
        const expEntries = Array.from(document.querySelectorAll('.exp-entry'));
        experiences.length = 0;
        expEntries.forEach(entry => experiences.push(entry.value));
        updateResume();
      });
      document.getElementById('experience-list').appendChild(textarea);
      experiences.push(exp);
    });
  }

  renderSkillTags();
  updateResume();
}

function applyTheme() {
  if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark-mode');
  }
}

function showLastUpdated() {
  const saved = JSON.parse(localStorage.getItem('resume-data'));
  if (saved?.lastUpdated) {
    const footer = document.querySelector('footer');
    if (footer) {
      const timestamp = document.createElement('p');
      timestamp.style.fontSize = '0.8rem';
      timestamp.style.color = '#888';
      timestamp.textContent = `Last Updated: ${saved.lastUpdated}`;
      footer.appendChild(timestamp);
    }
  }
}
