'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _mkpath = require('mkpath');

var _mkpath2 = _interopRequireDefault(_mkpath);

var _hbs = require('hbs');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _rss = require('rss');

var _rss2 = _interopRequireDefault(_rss);

var _package = require('./package.json');

var _package2 = _interopRequireDefault(_package);

var _posts = require('./posts.json');

var _posts2 = _interopRequireDefault(_posts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var page_dir = './templates/pages/';
var post_dir = './templates/posts/';
var tag_dir = './tag/';
var header_template = _hbs.handlebars.compile(_fs2.default.readFileSync('templates/includes/header.hbs', 'utf8'));
var footer_template = _hbs.handlebars.compile(_fs2.default.readFileSync('templates/includes/footer.hbs', 'utf8'));
var tag_template = _hbs.handlebars.compile(_fs2.default.readFileSync('templates/includes/tag.hbs', 'utf8'));

var tags = [];
var alltags = [];

_hbs.handlebars.registerHelper('version', function (block) {
  return _package2.default.version;
});

function getPosts() {
  var post_index = 1;
  _posts2.default.forEach(function (post) {
    post.display_date = (0, _moment2.default)(post.date, 'YYYY/MM/DD').format('MMM DD, YYYY');
    if (post.published) {
      post.post_index = post_index;
      post_index++;
    }
  });
  _posts2.default.reverse();
}

function getTags() {
  tags = _underscore2.default.uniq(_underscore2.default.flatten(_underscore2.default.pluck(_posts2.default, 'tags')));
  var tagcounts = {};
  tags.forEach(function (tag) {
    _posts2.default.forEach(function (post) {
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
      count: tagcounts[key]
    });
  }
  alltags = _underscore2.default.sortBy(alltags, 'count').reverse();
}

function renderTags() {
  tags.forEach(function (tag) {
    var taggedPosts = _posts2.default.filter(function (post) {
      return post.tags.indexOf(tag) >= 0;
    });
    var tag_html = header_template({
      title: '#' + tag + ' | frankrowe.org'
    });
    tag_html += tag_template({ posts: taggedPosts, tag: tag });
    tag_html += footer_template();
    var tag_path = tag_dir + tag + '.html';
    _fs2.default.writeFile(tag_path, tag_html);
  });
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderPages() {
  _fs2.default.readdir(page_dir, function (err, files) {
    files.forEach(function (page) {
      var title = capitalize(_path2.default.basename(page, '.hbs'));
      var html = header_template({
        title: title + ' | frankrowe.org'
      });
      html += renderPage(_path2.default.join(page_dir, page), {
        posts: _posts2.default
      });
      html += footer_template();
      var html_path = _path2.default.basename(page, '.hbs') + '.html';
      _fs2.default.writeFile(html_path, html);
    });
  });
}

function renderPage(page_path, data) {
  var template = _hbs.handlebars.compile(_fs2.default.readFileSync(page_path, 'utf8'));
  data.filename = page_path;
  data.alltags = alltags;
  var html = template(data);
  return html;
}

function renderIndex() {
  var index = header_template({
    title: 'frankrowe.org'
  });
  _posts2.default.forEach(function (post) {
    if (post.published) {
      index += renderPost(post);
    }
  });
  index += footer_template();
  _fs2.default.writeFile('index.html', index);
}

function renderPost(post) {
  post.content = _fs2.default.readFileSync(_path2.default.join(post_dir, post.file + '.hbs'), 'utf8');
  return renderPage('templates/includes/post.hbs', post);
}

function renderPosts() {
  _posts2.default.forEach(function (post) {
    if (post.published) {
      var html = header_template({
        title: post.title + ' | frankrowe.org'
      });
      html += renderPost(post);
      html += footer_template();
      var post_path = 'posts/' + post.date;
      _mkpath2.default.sync(post_path);
      post_path = _path2.default.join(post_path, post.file) + '.html';
      _fs2.default.writeFile(post_path, html);
    }
  });
}

function makeRSSFeed() {
  var feed = new _rss2.default({
    title: 'frankrowe.org',
    site_url: 'http://frankrowe.org',
    description: 'The personal blog of Frank Rowe, an independent web and GIS developer located on the Eastern Shore of Maryland.'
  });
  _underscore2.default.first(_posts2.default, 5).forEach(function (post) {
    feed.item({
      title: post.title,
      description: post.description,
      url: 'http://frankrowe.org/posts/' + post.date + '/' + post.file + '.html',
      guid: post.id,
      date: (0, _moment2.default)(post.date, 'YYYY/MM/DD')
    });
  });
  var xml = feed.xml();
  _fs2.default.writeFile('./rss.xml', xml);
}

function build(path) {
  console.log('build');
  getPosts();
  getTags();
  renderTags();
  renderPages();
  renderIndex();
  renderPosts();
  makeRSSFeed();
  console.log('done');
  return;
}

build();
