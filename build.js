const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const moment = require('moment');
const RSS = require('rss');
const pkg = require('./package.json');

const pageTemplatesPath = './templates/pages/';
const postTemplatePath = './templates/posts/';

const headerTemplate = Handlebars.compile(
  fs.readFileSync('templates/includes/header.hbs', 'utf8')
);
const footerTemplate = Handlebars.compile(
  fs.readFileSync('templates/includes/footer.hbs', 'utf8')
);
const postTemplate = Handlebars.compile(
  fs.readFileSync('templates/includes/post.hbs', 'utf8')
);

Handlebars.registerHelper('version', () => pkg.version);

function getPosts() {
  const posts = JSON.parse(fs.readFileSync('./posts.json'));
  return posts
    .filter((p) => p.published)
    .map((post) => ({
      ...post,
      display_date: moment(post.date, 'YYYY/MM/DD').format('YYYY-MM-DD'),
      path: path.join('/posts/' + post.date, post.file) + '.html',
    }));
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderPages(posts) {
  fs.readdir(pageTemplatesPath, (err, files) => {
    files.forEach((template) => {
      const basename = path.basename(template, '.hbs');
      const title = capitalize(basename);
      const header = headerTemplate({
        title: title + ' | frankrowe.org',
      });
      const content = renderPage(path.join(pageTemplatesPath, template), {
        posts: posts.slice().reverse(),
      });
      const footer = footerTemplate();
      const html = header + content + footer;
      fs.writeFile(basename + '.html', html, (err) => {
        if (err) console.log(err);
      });
    });
  });
}

function renderPosts(posts) {
  posts.forEach((post) => {
    const header = headerTemplate({
      title: post.title + ' | frankrowe.org',
    });
    const content = renderPost(post);
    const footer = footerTemplate();
    const html = header + content + footer;
    let postPath = 'posts/' + post.date;
    fs.mkdirSync(postPath, { recursive: true });
    const postFilePath = path.join(postPath, post.file) + '.html';
    fs.writeFile(postFilePath, html, (err) => {
      if (err) console.log(err);
    });
  });
}

function renderPage(pagePath, data) {
  const template = Handlebars.compile(fs.readFileSync(pagePath, 'utf8'));
  return template(data);
}

function renderIndex(posts) {
  const header = headerTemplate({
    title: 'frankrowe.org',
  });
  const content = posts
    .slice(posts.length - 5)
    .reverse()
    .reduce((acc, post) => (acc += renderPost(post)), '');
  const footer = footerTemplate();
  const html = header + content + footer;
  fs.writeFile('index.html', html, (err) => {
    if (err) console.log(err);
  });
}

function renderPost(post) {
  return postTemplate({
    ...post,
    content: fs.readFileSync(
      path.join(postTemplatePath, post.file + '.hbs'),
      'utf8'
    ),
  });
}

function makeRSSFeed(posts) {
  const feed = new RSS({
    title: 'frankrowe.org',
    site_url: 'http://frankrowe.org',
    description:
      'The personal blog of Frank Rowe, an independent web and GIS developer located on the Eastern Shore of Maryland.',
  });
  posts.slice(posts.length - 5).forEach((post) => {
    feed.item({
      title: post.title,
      description: post.description,
      url:
        'http://frankrowe.org/posts/' + post.date + '/' + post.file + '.html',
      guid: post.id,
      date: moment(post.date, 'YYYY-MM-DD'),
    });
  });
  const xml = feed.xml();
  fs.writeFile('./rss.xml', xml, (err) => {
    if (err) console.log(err);
  });
}

function build() {
  console.log('build');
  const posts = getPosts();
  renderPages(posts);
  renderIndex(posts);
  renderPosts(posts);
  makeRSSFeed(posts);
  console.log('done');
  return true;
}

build();
