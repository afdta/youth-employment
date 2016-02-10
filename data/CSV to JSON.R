library("reshape2")
setwd("~/Projects/Brookings/DataViz/YouthEmployment/data/CSV/")

for(f in list.files()){
  assign(sub("\\.csv","",f), read.csv(f, na.strings=c(""," ")) )
}
rm(list=c("f"))

