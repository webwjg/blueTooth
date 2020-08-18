<template>
<div class="container">
    <div class="container-box">
        <div class="top-box">
            <div class="logo">
                <img src="@/assets/logo.png" alt="">
                <!-- http://www.uugai.com/logoa/yulan.php?number=jz-2-120 -->
                <div class="personal">
                    个人中心
                </div>
            </div>
        </div>
        <div class="main">
            <el-tabs v-model="activeName"  @tab-click="handleClick">
              <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
              <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
              <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
              <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
            </el-tabs>

        </div>
    </div>
</div>
</template>
<script>
export default {
  data(){
    return{
  activeName: 'first',
    }
  },
  created(){},
  methods:{
    handleClick(tab, event) {
        console.log(tab,event);
    }
  },
}
</script>


<style lang="scss"  scoped>
.container-box{
    width:1200px;
    margin:0 auto;
    .top-box{
        width:100%;
        height:80px;
        .logo{
            display: flex;
            justify-content: space-between;
            img{
                width:200px;
                height:90px;
            }
            .personal{
                line-height: 90px;
            }
        }
    }
    .main{
        width:100%;
        margin-top:10px;
    }   
}

body{
    padding:0; 
}

</style>