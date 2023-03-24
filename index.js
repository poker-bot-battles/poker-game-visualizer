var express = require('express');
var app = express();

app.use(express.static('dist/poker-tournament-visualization'));
// redirect traffic with url parameters to the root
app.get('/*', function(req, res) {
    res.sendFile('dist/poker-tournament-visualization/index.html', {root: __dirname });
});

app.listen(4200);