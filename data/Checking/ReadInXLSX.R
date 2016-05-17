#READ IN DATA FROM ORIGINAL EXCEL SHEETS

library("gdata")
setwd("/home/alec/Projects/Brookings/DataViz/youth-employment/data/Youth data for AF/")

er = list()
er$tot <- read.xls("Final ER, UR data - long form.xlsx", "ER - Overall", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
er$sex <- read.xls("Final ER, UR data - long form.xlsx", "ER - Sex", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
er$race <- read.xls("Final ER, UR data - long form.xlsx", "ER - R-E", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
er$edu <- read.xls("Final ER, UR data - long form.xlsx", "ER - Edu", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)


ur = list()
ur$tot <- read.xls("Final ER, UR data - long form.xlsx", "UR - Overall", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
ur$sex <- read.xls("Final ER, UR data - long form.xlsx", "UR - Sex", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
ur$race <- read.xls("Final ER, UR data - long form.xlsx", "UR - R-E", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
ur$edu <- read.xls("Final ER, UR data - long form.xlsx", "UR - Edu", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)


dy = list()
dy$tot <- read.xls("Final DY data - long form.xlsx", "% of total", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
dy$sex <- read.xls("Final DY data - long form.xlsx", "% by sex", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
dy$race <- read.xls("Final DY data - long form.xlsx", "% by r-e", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
dy$nativity <- read.xls("Final DY data - long form.xlsx", "% by nativity", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)

dy$sex2 <- read.xls("Final DY data - long form.xlsx", "Characterstics - sex", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
dy$race2 <- read.xls("Final DY data - long form.xlsx", "Characteristics - r-e", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
dy$nativity2 <- read.xls("Final DY data - long form.xlsx", "Characteristics - nativity", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)
dy$edu2 <- read.xls("Final DY data - long form.xlsx", "Characteristics - edu", na.strings=c("N","","#VALUE!"), skip=0, header=TRUE)

saveRDS(er, "/home/alec/Projects/Brookings/DataViz/youth-employment/data/Checking/er.rds")
saveRDS(ur, "/home/alec/Projects/Brookings/DataViz/youth-employment/data/Checking/ur.rds")
saveRDS(dy, "/home/alec/Projects/Brookings/DataViz/youth-employment/data/Checking/dy.rds")