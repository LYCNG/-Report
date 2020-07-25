function initial(week,boss){
    if(week>=1 &&  week<=3){
        const time =[1, 1, 1.1, 1.1, 1.2]
        var num =time[boss-1]
        var stage = 1
    }else if(week>=4 && week<=9){
        const time =[1.6,1.6,1.8,1.8,2.0]
        var num =time[boss-1]
        var stage = 2
    }else if(week>9){
        const time= [2.0, 2.0, 2.4, 2.4, 2.6]
        var num =time[boss-1]
        var stage = 3
    }
    const data = {per:num,stage:stage}
    return data
}
const bosshealth=[600,800,1000,1200,2000]

module.exports = class stagesys{
    getper(week,boss){
        const resuilt = initial(week,boss)
        return resuilt.per
    }
    getstage(week,boss){
        const resuilt = initial(week,boss)
        return resuilt.stage
    }
    
    setBoss(boss,damage,week){
        const result={}
        var health = 0
        var w = 10000
        for(var i=0;i<boss-1;i++){
            health += bosshealth[i]*w
        }
        var remainder = bosshealth[boss-1]*w-(damage-health)
        if(remainder===0){
            if(boss===5){
                result.boss = 1
                result.health =bosshealth[0]*w
                result.week = week+1
            }else{
                result.boss = boss+1
                result.health = bosshealth[boss]*w
                result.week=week
            }
        }else{
            result.boss = boss
            result.health = remainder
            result.week= week
        }
        return result
    }
}
