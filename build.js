const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const mkpath = require('mkpath');
const { handlebars } = require('hbs');
const moment = require('moment');
const _ = require('underscore');
const RSS = require('rss');
const getAnalytics = require('./analytics');
const pkg = require('./package.json');
let posts = require('./posts.json');

const page_dir = './templates/pages/';
const post_dir = './templates/posts/';
const tag_dir = './tag/';
const header_template = handlebars.compile(
  fs.readFileSync('templates/includes/header.hbs', 'utf8')
);
const footer_template = handlebars.compile(
  fs.readFileSync('templates/includes/footer.hbs', 'utf8')
);
const tag_template = handlebars.compile(
  fs.readFileSync('templates/includes/tag.hbs', 'utf8')
);

let tags = [];
let alltags = [];

handlebars.registerHelper('version', block => {
  return pkg.version;
});


function getPosts() {
  var post_index = 1;
  posts.forEach(post => {
    post.display_date = moment(post.date, 'YYYY/MM/DD').format('MMM DD, YYYY');
    if (post.published) {
      post.post_index = post_index;
      post_index++;
    }

    let postPath = '/posts/' + post.date;
    postPath = path.join(postPath, post.file) + '.html';
    post.path = postPath;
  });
  posts.reverse();
}

function getTags() {
  tags = _.uniq(_.flatten(_.pluck(posts, 'tags')));
  let tagcounts = {};
  tags.forEach(tag => {
    posts.forEach(post => {
      if (post.tags.indexOf(tag) >= 0) {
        if (tagcounts[tag]) {
          tagcounts[tag]++;
        } else {
          tagcounts[tag] = 1;
        }
      }
    });
  });
  for (var key in tagcounts) {
    alltags.push({
      tag: key,
      count: tagcounts[key],
    });
  }
  alltags = _.sortBy(alltags, 'count').reverse();
}

function renderTags() {
  tags.forEach(tag => {
    let taggedPosts = posts.filter(post => {
      return post.tags.indexOf(tag) >= 0;
    });
    let tag_html = header_template({
      title: '#' + tag + ' | frankrowe.org',
    });
    tag_html += tag_template({ posts: taggedPosts, tag: tag });
    tag_html += footer_template();
    let tag_path = tag_dir + tag + '.html';
    fs.writeFile(tag_path, tag_html, writeFileCallback);
  });
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderPages() {
  fs.readdir(page_dir, (err, files) => {
    files.forEach(page => {
      let title = capitalize(path.basename(page, '.hbs'));
      let html = header_template({
        title: title + ' | frankrowe.org',
      });
      html += renderPage(path.join(page_dir, page), {
        posts: posts,
      });
      html += footer_template();
      let html_path = path.basename(page, '.hbs') + '.html';
      fs.writeFile(html_path, html, writeFileCallback);
    });
  });
}

function renderPage(page_path, data) {
  let template = handlebars.compile(fs.readFileSync(page_path, 'utf8'));
  data.filename = page_path;
  data.alltags = alltags;
  let html = template(data);
  return html;
}

function renderIndex() {
  let index = header_template({
    title: 'frankrowe.org',
  });
  posts.forEach((post, idx) => {
    if (post.published && idx < 10) {
      index += renderPost(post);
    }
  });
  index += footer_template();
  fs.writeFile('index.html', index, writeFileCallback);
}

function renderPost(post) {
  post.content = fs.readFileSync(
    path.join(post_dir, post.file + '.hbs'),
    'utf8'
  );
  return renderPage('templates/includes/post.hbs', post);
}

function renderPosts() {
  posts.forEach(post => {
    if (post.published) {
      let html = header_template({
        title: post.title + ' | frankrowe.org',
      });
      html += renderPost(post);
      html += footer_template();
      let post_path = 'posts/' + post.date;
      mkpath.sync(post_path);
      post_path = path.join(post_path, post.file) + '.html';
      fs.writeFile(post_path, html, writeFileCallback);
    }
  });
}

function makeRSSFeed() {
  let feed = new RSS({
    title: 'frankrowe.org',
    site_url: 'http://frankrowe.org',
    description:
      'The personal blog of Frank Rowe, an independent web and GIS developer located on the Eastern Shore of Maryland.',
  });
  _.first(posts, 5).forEach(post => {
    feed.item({
      title: post.title,
      description: post.description,
      url:
        'http://frankrowe.org/posts/' + post.date + '/' + post.file + '.html',
      guid: post.id,
      date: moment(post.date, 'YYYY/MM/DD'),
    });
  });
  let xml = feed.xml();
  fs.writeFile('./rss.xml', xml, writeFileCallback);
}

function writeFileCallback(err, result) {
  if (err) console.log('error', err);
}

async function build(path) {
  console.log('build');
  getPosts();
  posts = await getAnalytics(posts);
  console.log(posts);
  getTags();
  renderTags();
  renderPages();
  renderIndex();
  renderPosts();
  makeRSSFeed();
  // console.log('done');
  return;
}

build();
