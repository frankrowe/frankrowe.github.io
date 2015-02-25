var fs = require('fs')
  , path = require('path')
  , mkpath = require('mkpath')
  , handlebars = require('hbs').handlebars
  , moment = require('moment')

var page_dir = './views/pages/'
var post_dir = './views/posts/'
var header_template =  handlebars.compile(fs.readFileSync('views/includes/header.hbs', 'utf8'))
var footer_template =  handlebars.compile(fs.readFileSync('views/includes/footer.hbs', 'utf8'))
var posts = require(post_dir + 'posts.json')
var post_index = 1
posts.forEach(function(post) {
  post.display_date = moment(post.date, 'YYYY/MM/DD').format('MMM DD, YYYY')
  if (post.published) {
    post.post_index = post_index
    post_index++
  }
})
posts.reverse()

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function renderPages() {
  fs.readdir(page_dir, function(err, files) {
    files.forEach(function(page) {
      var title = capitalize(path.basename(page, '.hbs'))
      var html = header_template({
        title: title
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
  return renderPage('views/includes/post.hbs', post)
}

function renderPosts() {
  posts.forEach(function(post) {
    if (post.published) {
      var html = header_template({
        title: post.title
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

renderPages()
renderIndex()
renderPosts()