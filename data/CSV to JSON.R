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
dy$char_sex <- DY_Char_Sex[,c(1,3,5,10,12,17,19,24:28)]
dy$nativity <- DY_Nativity[,c(1,3,5,7,12,14,19,20,21)]
dy$race <- DY_Race[,c(1,3,5,7,12,14,19,20,21)]
dy$sex <- DY_Sex[,c(1,3,5,7,12,14,19,20,21)]
dy$overall <- DY_Overall[,c(1,3,5,10,12,17,18,19)]
#slim down the ER data
er$edu <- ER_Edu[!(ER_Edu$age_recode=="16-19" & (ER_Edu$ed_label %in% c("SC","AA","BA+"))),c(1,2,4,13,7,12,15,20,21,22)]
er$race <- ER_Race[,c(1,2,4,13,7,12,15,20,21,22)]
er$sex <- ER_Sex[,c(1,2,4,13,7,12,15,20,21,22)]
er$overall <- ER_Overall[,c(1,2,4,6,11,13,18,19,20)]
#slim down the UR data
ur$edu <- UR_Edu[!(UR_Edu$age_recode=="16-19" & (UR_Edu$ed_label %in% c("SC","AA","BA+"))),c(1,2,4,13,7,12,15,20,21,22)]
ur$race <- UR_Race[,c(1,2,4,13,7,12,15,20,21,22)]
ur$sex <- UR_Sex[,c(1,2,4,13,7,12,15,20,21,22)]
ur$overall <- UR_Overall[,c(1,2,4,6,11,13,18,19,20)]

#make rectangular -- import strings not as factors
er$edu[,c("re_label","sex_label")] <- list(a="ar",b="bs")
er$edu$ed_label <- sub("\\+","Plus",er$edu$ed_label)
er$race[,c("ed_label","sex_label")] <- list(a="ae",b="bs")
er$sex[,c("ed_label","re_label")] <- list(a="ae",b="ar")
er$overall[,c("ed_label","sex_label","re_label")] <- list(a="ae",b="bs",c="ar")
er$all <- rbind(er$edu,er$race,er$sex,er$overall)
  max(er$all$ER, na.rm=TRUE)

er$all$age_recode <- sub("-","to",er$all$age_recode)
er$all$sex_label <- sub("ale|emale","",er$all$sex_label)
er$all$re_label <- sub("sian|lack|hite|ther|atino","",er$all$re_label)

ur$edu[,c("re_label","sex_label")] <- list(a="ar",b="bs")
ur$edu$ed_label <- sub("\\+","Plus",ur$edu$ed_label)
ur$race[,c("ed_label","sex_label")] <- list(a="ae",b="bs")
ur$sex[,c("ed_label","re_label")] <- list(a="ae",b="ar")
ur$overall[,c("ed_label","sex_label","re_label")] <- list(a="ae",b="bs",c="ar")
ur$all <- rbind(ur$edu,ur$race,ur$sex,ur$overall)
  max(ur$all$UR, na.rm=TRUE)
  highUR <- ur$all[ur$all$UR>0.9 & !is.na(ur$all$UR), ]

ur$all$age_recode <- sub("-","to",ur$all$age_recode)
ur$all$sex_label <- sub("ale|emale","",ur$all$sex_label)
ur$all$re_label <- sub("sian|lack|hite|ther|atino","",ur$all$re_label)

dy$nativity[,c("re_label","sex_label")] <- list(a="ar",b="bs")
dy$race[,c("fb_label","sex_label")] <- list(a="an",b="bs")
dy$sex[,c("re_label","fb_label")] <- list(a="ar",b="an")
dy$overall[,c("re_label","sex_label","fb_label")] <- list(a="ar",b="bs",c="an")
dy$all <- rbind(dy$overall, dy$nativity, dy$race, dy$sex)

dy$all$age_recode <- sub("-","to",dy$all$age_recode)
dy$all$sex_label <- sub("ale|emale","",dy$all$sex_label)
dy$all$re_label <- sub("sian|lack|hite|ther|atino","",dy$all$re_label)
  max(dy$all$ShareDY, na.rm=TRUE)

splitter <- function(df, keep, renames=keep, dy=FALSE){
  if("YEAR" %in% names(df)){
    D <- df[df$YEAR %in% 2008:2014, ]
    D$YEAR <- D$YEAR - 2000
  } else{
    D <- df
  }
  
  if(dy){
    lastsplit <- "fb_label"
  } else{
    lastsplit <- "ed_label"
  }
  
  s <- split(D, D$Assigned_CBSA)
  s0 <- lapply(s, function(e){
    #split metro groups by age
    s0s <- split(e, e$age_recode)
    s1 <- lapply(s0s, function(e){
      #split metro age groups by sex
      s1s <- split(e, e$sex_label)
      s2 <- lapply(s1s, function(e){
        #split metro-age-sex groups by race
        s2s <- split(e, e$re_label)
        s3 <- lapply(s2s, function(e){
          #split metro-age-sex-race groups by edu
          s3s <- split(e, e[,lastsplit])
          s4 <- lapply(s3s, function(e){
            K <- e[keep]
            names(K) <- renames
            K$SH <- round(K$SH*100,1)
            K$SH_M <- round(K$SH_M*100,1)
            return(K)
          })
          return(s4)
        })
        return(s3)
      })
      return(s2)
    })
    return(s1)
  })
  return(s0)
}

splitDY <- function(df){
  df$age_recode <- sub("-","to",df$age_recode)
  m <- split(df, df$Assigned_CBSA)
  m1 <- lapply(m, function(e){
    return(split(e, e$age_recode))
  })
  return(m1)
}

ERSplit <- splitter(er$all, c("YEAR","EMP","denom","ER","MOE_ER"), c("Y","E","P","SH","SH_M"))
URSplit <- splitter(ur$all, c("YEAR","UNEMP","denom","UR","MOE_UR"), c("Y","U","P","SH","SH_M"))
DYSplits <- list()
DYSplits$Rates <- splitter(dy$all, c("DY","denom","ShareDY","MOE_ShareDY"), c("DY","P","SH","SH_M"), TRUE)
DYSplits$Char <- list()
DYSplits$Char$Edu <- splitDY(dy$char_edu)
DYSplits$Char$Race <- splitDY(dy$char_race)
DYSplits$Char$Nativity <- splitDY(dy$char_nativity)
DYSplits$Char$Sex <- splitDY(dy$char_sex)


writeLines(toJSON(ERSplit, digits=5, na="null"), "../er.json")
writeLines(toJSON(URSplit, digits=5, na="null"), "../ur.json")
writeLines(toJSON(DYSplits, digits=5, na="null"), "../dy.json")

overall <- list()
overall$er <- lapply(ERSplit, function(e){
  r <- list("16to19"=e[["16to19"]]$bs$ar$ae, "20to24"=e[["20to24"]]$bs$ar$ae, "25to54"=e[["25to54"]]$bs$ar$ae )
  return(r)
})
overall$ur <- lapply(URSplit, function(e){
  r <- list("16to19"=e[["16to19"]]$bs$ar$ae, "20to24"=e[["20to24"]]$bs$ar$ae, "25to54"=e[["25to54"]]$bs$ar$ae )
  return(r)
})
overall$dy <- lapply(DYSplits$Rates, function(e){
  r <- list("16to19"=e[["16to19"]]$bs$ar$an, "20to24"=e[["20to24"]]$bs$ar$an, "25to54"=e[["25to54"]]$bs$ar$an )
  return(r)
})

writeLines(toJSON(overall, digits=5, na="null"), "../overall.json")

sum(names(overall$er) == names(ERSplit))
sum(names(overall$ur) == names(URSplit))
sum(names(overall$dy) == names(DYSplits$Rates))

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


#ALTERNATIVE STRUCTURE
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