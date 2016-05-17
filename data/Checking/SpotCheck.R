pullVal <- function(stat=c("er", "ur", "dy"), geo="_*US|United States", cut=c("tot","race","sex","edu","nativity"), fv=NULL, age=c("all","a","b","c"), year=NULL){
  stat <- match.arg(stat)
  cut <- match.arg(cut)
  age <- match.arg(age)
  
  if(stat=="er"){
    var <- "ER"
    moe <- "MOE_ER"
  } else if(stat=="ur"){
    var <- "UR"
    moe <- "MOE_UR"
  } else if(stat=="dy"){
    var <- "ShareDY"
    moe <- "MOE_ShareDY"
  }
  
  if(cut=="sex" && stat=="dy"){
    fil <- "sex_label"
  } else if(cut=="sex"){
    fil <- "SEX"
  } else if(cut=="race"){
    fil <- "re_label"
  } else if(cut=="edu"){
    fil <- "ed_label"
  } else if(cut=="nativity"){
    fil <- "fb_label"
  } else{
    fil <- NULL
  }
  
  tmp <- get(stat)[[cut]]
  
  if(!is.null(fil) && !is.null(fv)){
    tmp2 <- tmp[as.character(tmp[,fil])==fv, ]
  } else{
    tmp2 <- tmp
  }
  
  if(age=="a"){
    ar <- "16-19"
  } else if(age=="b"){
    ar <- "20-24"
  } else if(age=="c"){
    ar <- "25-54"
  } else{
    ar <- NULL
  }
  
  if(!is.null(ar)){
    tmp3a <- tmp2[tmp2[, "age_recode"]==ar, ]
  } else{
    tmp3a <- tmp2
  }
  
  if(!is.null(year) && stat!="dy"){
    tmp3 <- tmp3a[tmp3a$YEAR==year, ]
  } else{
    tmp3 <- tmp3a
  }
  
  pos <- grep(paste0("^",geo), tmp3[,"Assigned_CBSATitle"], ignore.case=TRUE)
  
  keepvars <- c("Assigned_CBSATitle", var, moe, "age_recode", fil)
  if(stat %in% c("er", "ur")){
    keepvars <- c("YEAR", keepvars)
  }
  
  tmp4 <- tmp3[pos, keepvars]
  
  return(tmp4)
}

pullChar <- function(geo="_*US|United States", cut=c("race","sex","edu","nativity") ){
  if(cut=="sex"){
    tmp <- dy$sex2
    keepvars <- c("S_male","MOE_Smale","S_female","MOE_Sfemale")
  } else if(cut=="race"){
    tmp <- dy$race2
    keepvars <- c("S_White","MOE_Swhite","S_Black","MOE_Sblack","S_Latino","MOE_Slatino","S_Asian","MOE_Sasian","S_Other","MOE_Sother")
  } else if(cut=="edu"){
    tmp <- dy$edu2
    keepvars <- c("S_lths","MOE_Slths","S_hs","MOE_Shs","S_sc","MOE_Ssc")
  } else if(cut=="nativity"){
    tmp <- dy$nativity2
    keepvars <- c("S_FB","MOE_Sfb","S_NB","MOE_Snb")
  } else{
    tmp <- NULL
    fil <- NULL
    keepvars <- c()
  }
  
  keepvars <- c("Assigned_CBSATitle", "age_recode", keepvars)
  pos <- grep(paste0("^",geo), tmp[,"Assigned_CBSATitle"], ignore.case=TRUE)
  
  tmp2 <- tmp[pos, keepvars]
  
  return(tmp2)
}


er <- readRDS("/home/alec/Projects/Brookings/DataViz/youth-employment/data/Checking/er.rds")
ur <- readRDS("/home/alec/Projects/Brookings/DataViz/youth-employment/data/Checking/ur.rds")
dy <- readRDS("/home/alec/Projects/Brookings/DataViz/youth-employment/data/Checking/dy.rds")


#SPOT CHECK VALUES
# stat=c("er", "ur", "dy")
# geo="_*US|United States"
# cut=c("tot","race","sex","edu","nativity","sex2","edu2","race2","nativity2")
# fv=NULL
# age=c("a","b","c")
pullVal("er", "birmingham", "tot", age="all", year=2014)
pullVal("ur", "birmingham", "tot", age="all", year=2014)
pullVal("dy", "birmingham", "tot", age="all")

pullVal("er", "cape coral", "sex", age="all", year=2014)
pullVal("er", "cape coral", "race", age="all", year=2014,fv="White")
pullVal("er", "boston", "edu", age="all", year=2014, fv="InSch")

pullVal("er", "boston", "edu", age="all", year=2014, fv="InSch")
pullVal("er", "boston", "edu", age="all", year=2014, fv="LTHS")
pullVal("er", "boston", "edu", age="all", year=2014, fv="HS")
pullVal("er", "boston", "edu", age="all", year=2014, fv="SC")
pullVal("er", "boston", "edu", age="all", year=2014, fv="AA")
pullVal("er", "boston", "edu", age="all", year=2014, fv="BA+")

  
pullVal("ur", "seattle", "sex", age="all", year=2014,fv="Female")
pullVal("ur", "seattle", "race", age="all", year=2014,fv="White")
pullVal("ur", "seattle", "edu", age="all", year=2014, fv="InSch")

pullVal("ur", "miami", "edu", age="all", year=2014, fv="InSch")
pullVal("ur", "miami", "edu", age="all", year=2014, fv="LTHS")
pullVal("ur", "boise", "edu", age="all", year=2014, fv="HS")
pullVal("ur", "boise", "edu", age="all", year=2014, fv="SC")
pullVal("ur", "portland", "edu", age="all", year=2014, fv="AA")
pullVal("ur", "portland", "edu", age="all", year=2014, fv="BA+")


pullVal("dy", "tampa", "sex", age="all", fv="Female")
pullVal("dy", "tampa", "race", age="all", year=2014,fv="White")
pullVal("dy", "tampa", "nativity", age="all", year=2014, fv="FB")  
  
pullChar("tulsa", "sex")  
pullChar("tulsa", "race") 
pullChar("tulsa", "edu") 
pullChar("tulsa", "nativity") 
