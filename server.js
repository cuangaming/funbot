const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // simpan PAT GitHub
const REPO_OWNER = 'cuangaming';
const REPO_NAME = 'funbot';
const FILE_PATH = 'testimoni.json';
const BRANCH = 'main';

app.post('/tambah-testimoni', async (req, res) => {
  const { nama, komen } = req.body;
  if (!nama || !komen) return res.status(400).json({ error: 'Nama & komentar wajib diisi!' });

  try {
    const getFile = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });

    const content = Buffer.from(getFile.data.content, 'base64').toString();
    const testimoniArr = JSON.parse(content);
    testimoniArr.push({ nama, komen });

    const updatedContent = Buffer.from(JSON.stringify(testimoniArr, null, 2)).toString('base64');

    await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      message: `Menambahkan testimoni baru: ${nama}`,
      content: updatedContent,
      sha: getFile.data.sha,
      branch: BRANCH
    }, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });

    res.json({ success: true, message: 'Testimoni berhasil ditambahkan!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan testimoni!' });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server berjalan'));
