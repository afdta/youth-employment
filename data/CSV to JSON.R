#to do: test the geo codes here

library("reshape2")
setwd("~/Projects/Brookings/DataViz/youth-employment/data/CSV/")

for(f in list.files()){
  assign(sub("\\.csv","",f), read.csv(f, na.strings=c(""," "), stringsAsFactors=FALSE) )
}
rm(list=c("f"))

lv <- function(df){
  nm <- names(df)
  nl <- ""
  s <- paste("(", 1:length(nm),")...", nm, sep="",collapse="\n")
  cat(s)
}

#store final processed data in
dy <- list() 
er <- list()
ur <- list()

#slim down the DY data
dy$char_edu <- DY_Char_Edu[,c(1,3,5,10,12,17,19,24,26,31:37)]
dy$char_nativity <- DY_Char_Nativity[,c(1,3,5,10,12,17,19,24:28)]
dy$char_race <- DY_Char_Race[,c(1,3,5,10,12,17,19,24,26,31,33,38,40,45,46:55)]
dy$char_sex <- DY_Char_Sex[,c(1,3,5,10,12,17,19,24,25,26)]
dy$nativity <- DY_Nativity[,c(1,3,5,7,12,14,19,20,21)]
dy$race <- DY_Race[,c(1,3,5,7,12,14,19,20,21)]
dy$sex <- DY_Sex[,c(1,3,5,7,12,14,19,20,21)]
dy$overall <- DY_Overall[,c(1,3,5,10,12,17,18,19)]
#slim down the ER data
er$edu <- ER_Edu[,c(1,2,4,13,7,12,15,20,21,22)]
er$race <- ER_Race[,c(1,2,4,13,7,12,15,20,21,22)]
er$sex <- ER_Sex[,c(1,2,4,13,7,12,15,20,21,22)]
er$overall <- ER_Overall[,c(1,2,4,6,11,13,18,19,20)]
#slim down the UR data
ur$edu <- UR_Edu[,c(1,2,4,13,7,12,15,20,21,22)]
ur$race <- UR_Race[,c(1,2,4,13,7,12,15,20,21,22)]
ur$sex <- UR_Sex[,c(1,2,4,13,7,12,15,20,21,22)]
ur$overall <- UR_Overall[,c(1,2,4,6,11,13,18,19,20)]

#make rectangular -- import strings not as factors
er$edu[,c("re_label","sex_label")] <- list(a="All",b="All")
er$race[,c("ed_label","sex_label")] <- list(a="All",b="All")
er$sex[,c("ed_label","re_label")] <- list(a="All",b="All")
er$overall[,c("ed_label","sex_label","re_label")] <- list(a="All",b="All",c="All")
er$all <- rbind(er$edu,er$race,er$sex,er$overall)

ur$edu[,c("re_label","sex_label")] <- list(a="All",b="All")
ur$race[,c("ed_label","sex_label")] <- list(a="All",b="All")
ur$sex[,c("ed_label","re_label")] <- list(a="All",b="All")
ur$overall[,c("ed_label","sex_label","re_label")] <- list(a="All",b="All",c="All")
ur$all <- rbind(ur$edu,ur$race,ur$sex,ur$overall)

dy$nativity[,c("re_label","sex_label")] <- list(a="All",b="All")
dy$race[,c("fb_label","sex_label")] <- list(a="All",b="All")
dy$sex[,c("re_label","fb_label")] <- list(a="All",b="All")
dy$overall[,c("re_label","sex_label","fb_label")] <- list(a="All",b="All",c="All")
dy$all <- rbind(dy$overall, dy$nativity, dy$race, dy$sex)

#some checks
unique(er$all[is.na(er$all$MOE_ER) & !is.na(er$all$ER),c("YEAR")]) #MOE is only NA in 2000
#why aren't there a multiple of metros observations?
Akron <- er$edu[er$edu$Assigned_CBSA==10420,]
AkronNA <- Akron[is.na(Akron$EMP) | is.na(Akron$denom),]
with(Akron, table(age_recode, ed_label))
with(er$edu, table(age_recode, ed_label))
allNA <- er$edu[is.na(er$edu$EMP) & is.na(er$edu$denom),] #no obs with both num and denom missing
lapply(ur, function(e){with(e, table(YEAR))})
Akron <- ur$sex[ur$sex$Assigned_CBSA==10420,]

prepDat <- function(dat){
  
}