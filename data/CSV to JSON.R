#to do: test the geo codes here
#question: why are some obs missing? if num, denom are both NA? is 2000 MOE zero always?

library("reshape2")
library("jsonlite")
setwd("~/Projects/Brookings/DataViz/youth-employment/data/CSV/")
setwd("~/Projects/Brookings/youth-employment/data/CSV/")

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
er$edu[,c("re_label","sex_label")] <- list(a="AR",b="BS")
er$edu$ed_label <- sub("\\+","Plus",er$edu$ed_label)
er$race[,c("ed_label","sex_label")] <- list(a="AE",b="BS")
er$sex[,c("ed_label","re_label")] <- list(a="AE",b="AR")
er$overall[,c("ed_label","sex_label","re_label")] <- list(a="AE",b="BS",c="AR")
er$all <- rbind(er$edu,er$race,er$sex,er$overall)
er$all$age_recode <- sub("-","to",er$all$age_recode)

ur$edu[,c("re_label","sex_label")] <- list(a="AR",b="BS")
ur$edu$ed_label <- sub("\\+","Plus",ur$edu$ed_label)
ur$race[,c("ed_label","sex_label")] <- list(a="AE",b="BS")
ur$sex[,c("ed_label","re_label")] <- list(a="AE",b="AR")
ur$overall[,c("ed_label","sex_label","re_label")] <- list(a="AE",b="BS",c="AR")
ur$all <- rbind(ur$edu,ur$race,ur$sex,ur$overall)
ur$all$age_recode <- sub("-","to",ur$all$age_recode)

dy$nativity[,c("re_label","sex_label")] <- list(a="AR",b="BS")
dy$race[,c("fb_label","sex_label")] <- list(a="AN",b="BS")
dy$sex[,c("re_label","fb_label")] <- list(a="AR",b="AN")
dy$overall[,c("re_label","sex_label","fb_label")] <- list(a="AR",b="BS",c="AN")
dy$all <- rbind(dy$overall, dy$nativity, dy$race, dy$sex)
dy$all$age_recode <- sub("-","to",dy$all$age_recode)

doublesplit <- function(df){
  s0 <- split(df, df$Assigned_CBSA)
  s1 <- lapply(s0, function(e){return(split(e, e$age_recode))})
  return(s1)
}

puller <- function(v.var){
  casted <- dcast(er$all, YEAR + Assigned_CBSA + age_recode ~ sex_label + re_label + ed_label, value.var = v.var)
  return(doublesplit(casted))
}
pullur <- function(v.var){
  casted <- dcast(ur$all, YEAR + Assigned_CBSA + age_recode ~ sex_label + re_label + ed_label, value.var = v.var)
  return(doublesplit(casted))
}
pulldy <- function(v.var){
  casted <- dcast(dy$all, Assigned_CBSA + age_recode ~ sex_label + re_label + fb_label, value.var = v.var)
  return(doublesplit(casted))
}



fer <- list()
fer$emp <- puller("EMP")
fer$emp_moe <- puller("moe_n")
fer$tot <- puller("denom")
fer$tot_moe <- puller("moe_d")
fer$er <- puller("ER")
fer$er_moe <- puller("MOE_ER")
fer$json <- toJSON(fer, digits=5, na="null")
writeLines(fer$json, "../er.json")



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