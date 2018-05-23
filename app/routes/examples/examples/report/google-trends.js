const googleTrends = require("google-trends-api")

const optionsObject = {
  keyword:['jb pritzker','bruce rauner'],
  startTime:new Date('2018-01-01'),
  geo:"US"
}

googleTrends.interestOverTime(optionsObject)
.then(function(results){
  console.log(results)
}).catch(function(err){
  console.log(err)
})
