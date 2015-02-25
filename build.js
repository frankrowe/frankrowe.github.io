var ejs = require('ejs')
  , fs = require('fs')
  , path = require('path')
  , mkpath = require('mkpath')

var page_dir = './views/pages/'
var post_dir = './views/posts/'
var header_template = fs.readFileSync('views/includes/header.ejs', 'utf8')
var footer_template = fs.readFileSync('views/includes/footer.ejs', 'utf8')
var posts = require(post_dir + 'posts.json')
var post_index = 1
posts.forEach(function(post) {
  if (post.published) {
    post.post_index = post_index
    post_index++
  }
})
posts.reverse()

function renderPages() {
  fs.readdir(page_dir, function(err, files) {
    files.forEach(function(page) {
      var html = renderPage(path.join(page_dir, page), {
        title: 'frankrowe.org',
        posts: posts
      })
      var html_path = path.basename(page, '.ejs') + '.html'
      fs.writeFile(html_path, html)
    })
  })
}

function renderPage(page_path, data) {
  var template = fs.readFileSync(page_path, 'utf8')
  data.filename = page_path
  var html = ejs.render(template, data)
  return html
}

function renderIndex() {
  var index = ejs.render(header_template, {
    title: 'frankrowe.org'
  })
  //posts.reverse() //reverse chronological
  posts.forEach(function(post) {
    if (post.published) {
      index += renderPost(post)
    }
  })
  index += ejs.render(footer_template)
  fs.writeFile('index.html', index)
}

function renderPost(post) {
  post.content = fs.readFileSync(path.join(post_dir, post.file + '.ejs'), 'utf8')
  return renderPage('views/includes/post.ejs', post)
}

function renderPosts() {
  posts.forEach(function(post) {
    if (post.published) {
      var html = ejs.render(header_template, {
        title: post.title
      })
      html += renderPost(post)
      html += ejs.render(footer_template)
      var post_path = 'posts/' + post.date
      mkpath.sync(post_path)
      post_path = path.join(post_path, post.file) + '.html'
      fs.writeFile(post_path, html)
    }
  })
}

renderPages()
renderIndex()
renderPosts()