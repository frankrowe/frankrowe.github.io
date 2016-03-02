var fs = require('fs')
  , path = require('path')
  , mkpath = require('mkpath')
  , handlebars = require('hbs').handlebars
  , moment = require('moment')
  , chokidar = require('chokidar')
  , _ = require('underscore')
  , RSS = require('rss')

var page_dir = './templates/pages/'
  , post_dir = './templates/posts/'
  , tag_dir = './tag/'

var posts, tags, alltags, header_template, footer_template, tag_template

function getTemplates() {
  header_template =  handlebars.compile(fs.readFileSync('templates/includes/header.hbs', 'utf8'))
  footer_template =  handlebars.compile(fs.readFileSync('templates/includes/footer.hbs', 'utf8'))
  tag_template =  handlebars.compile(fs.readFileSync('templates/includes/tag.hbs', 'utf8'))
}

function getPosts() {
  posts = JSON.parse(fs.readFileSync('./posts.json'))
  var post_index = 1
  posts.forEach(function(post) {
    post.display_date = moment(post.date, 'YYYY/MM/DD').format('MMM DD, YYYY')
    if (post.published) {
      post.post_index = post_index
      post_index++
    }
  })
  posts.reverse()
  getTags()
}

function getTags() {
  tags = _.uniq(_.flatten(_.pluck(posts, 'tags')))
  var tagcounts = {}
  tags.forEach(function(tag) {
    posts.forEach(function(post) {
      if (post.tags.indexOf(tag) >=0) {
        if (tagcounts[tag]) {
          tagcounts[tag]++
        } else {
          tagcounts[tag] = 1
        }
      }
    })
  })
  alltags = []
  for (var key in tagcounts) {
    alltags.push({
      tag: key,
      count: tagcounts[key]
    })
  }
  alltags = _.sortBy(alltags, 'count').reverse()
}

function renderTags() {
  tags.forEach(function(tag) {
    var p = []
    posts.forEach(function(post) {
      if (post.tags.indexOf(tag) >=0) {
        p.push(post)
      }
    })
    var tag_html = header_template({
      title: '#' + tag + ' | frankrowe.org'
    })
    tag_html += tag_template({posts: p, tag: tag})
    tag_html += footer_template()
    var tag_path = tag_dir + tag + '.html'
    fs.writeFile(tag_path, tag_html)
  })
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function renderPages() {
  fs.readdir(page_dir, function(err, files) {
    files.forEach(function(page) {
      var title = capitalize(path.basename(page, '.hbs'))
      var html = header_template({
        title: title + ' | frankrowe.org'
      })
      html += renderPage(path.join(page_dir, page), {
        posts: posts
      })
      html += footer_template()
      var html_path = path.basename(page, '.hbs') + '.html'
      fs.writeFile(html_path, html)
    })
  })
}

function renderPage(page_path, data) {
  var template =  handlebars.compile(fs.readFileSync(page_path, 'utf8'))
  data.filename = page_path
  data.alltags = alltags
  var html = template(data)
  return html
}

function renderIndex() {
  var index = header_template({
    title: 'frankrowe.org'
  })
  posts.forEach(function(post) {
    if (post.published) {
      index += renderPost(post)
    }
  })
  index += footer_template()
  fs.writeFile('index.html', index)
}

function renderPost(post) {
  post.content = fs.readFileSync(path.join(post_dir, post.file + '.hbs'), 'utf8')
  return renderPage('templates/includes/post.hbs', post)
}

function renderPosts() {
  posts.forEach(function(post) {
    if (post.published) {
      var html = header_template({
        title: post.title + ' | frankrowe.org'
      })
      html += renderPost(post)
      html += footer_template()
      var post_path = 'posts/' + post.date
      mkpath.sync(post_path)
      post_path = path.join(post_path, post.file) + '.html'
      fs.writeFile(post_path, html)
    }
  })
}

function makeRSSFeed() {
  var feed = new RSS({
    title: 'frankrowe.org',
    site_url: 'http://frankrowe.org',
    description: 'The personal blog of Frank Rowe, an independent web and GIS developer located on the Eastern Shore of Maryland.'
  })
  _.first(posts, 5).forEach(function(post) {
    feed.item({
      title: post.title,
      description: post.description,
      url: 'http://frankrowe.org/posts/' + post.date + '/' + post.file + '.html',
      guid: post.id,
      date: moment(post.date, 'YYYY/MM/DD')
    })
  })
  var xml = feed.xml()
  fs.writeFile('./rss.xml', xml)
}

function build(path) {
  console.log('build')
  getTemplates()
  getPosts()
  renderTags()
  renderPages()
  renderIndex()
  renderPosts()
  makeRSSFeed()
  console.log('done')
}

var watcher = chokidar.watch(['./templates', './posts.json'], {
  ignored: /[\/\\]\./,
  persistent: true
})

watcher.on('change', build)
build()
