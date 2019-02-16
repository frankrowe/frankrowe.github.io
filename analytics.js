const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const _ = require('underscore');
const keyPath = './frankrowe org-60322bc2ff78.json';

function connect() {
  return new Promise((resolve, reject) => {
    const serviceAccountJwt = JSON.parse(fs.readFileSync(keyPath));
    const scope = ['https://www.googleapis.com/auth/analytics'];

    const { client_email, private_key } = serviceAccountJwt;
    const client = new google.auth.JWT(client_email, null, private_key, scope, null);

    client.authorize((err) => {
      if (err) reject(err);
      else resolve(client);
    });
  });
}

async function getAnalytics(client, filters) {
  const analyticsreporting = google.analyticsreporting({
    version: 'v4',
    auth: client,
  });
  const res = await analyticsreporting.reports.batchGet({
    requestBody: {
      reportRequests: [{
        viewId: '98556943',
        dateRanges: [{
          startDate: '2018-01-01',
          endDate: new Date().toISOString().substring(0, 10)
        }],
        dimensions: [{
          name: "ga:pagePath"
        }],
        metrics: [{
          "expression": "ga:pageviews"
        }],
        dimensionFilterClauses: [{
          filters: filters
        }],
      }],
    },
  });
  return res.data;
}

function mapToFilter(post) {
  return {
    operator: "EXACT",
    dimensionName: "ga:pagePath",
    expressions: [post.path],
  };
}

function mapPageViews(rows, posts) {
  return posts.map(function (post) {
    const row = rows.filter(function (row) {
      return row.dimensions.indexOf(post.path) >= 0;
    })[0];
    if (row) {
      const pageViews = row.metrics[0].values[0];
      post.pageViews = +pageViews;
    } else {
      post.pageViews = 0;
    }
    return post;
  });
}

async function run(posts) {
  try {
    let client = await connect();
    const filters = posts.map(mapToFilter);
    const response = await getAnalytics(client, filters);
    return mapPageViews(response.reports[0].data.rows, posts);
  } catch (e) {
    return posts;
  }
}

module.exports = run;