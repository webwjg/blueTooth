// pages/blueTooth/blueTooth.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

    devicesList:[],
    isHideList:true,    //是否隐藏蓝牙列表
    isHideConnect:false, //是否隐藏连接模块
    deviceId:'',
    connectName:'',
    writeNews:{}, //写数据三个id
    queryData:{
      query:[0x02,0x09,0x00,0x01,0x6A,0x00,0x50,0x06],
      stateTest:[0x01,0x08,0x02,0x00,0x56,0x00,0x59,0x06],
    },


	},

	/**
	 * 生命周期函数--监听页面加载
	 */

     // ****流程，大纲
  onLoad: function(options) {
      //目前只支持低功耗蓝牙，文档上的两套api是可以结合使用的，安卓
    let that=this;
    wx.getSystemInfo({
        success (res) {
          console.log(res);
          let gps=res.locationEnabled;
          if(!gps){
            wx.showModal({
              title: '请打开GPS定位',
              content: '不打开GPS定位，可能无法搜索到蓝牙设备',
              showCancel: false
            })
          }else{
            that.openBluetoothAdapter();
          }
        }
      }) 

  },
openBluetoothAdapter(){
    wx.openBluetoothAdapter({
      success (res) {
      
        wx.onBluetoothAdapterStateChange(function (res) {
          if(!res.available){//蓝牙适配器是否可用
            wx.showModal({
                title: '温馨提示',
                content: '蓝牙蓝牙适配器不可用，请重新启动',
                showCancel: false
              })
          }
        })
        that.searchBlue(); //开始搜索蓝牙
      },
      fail(res){
     
        console.log(res);
        wx.showToast({
          title: '请检查手机蓝牙是否打开',
          icon:'none',
        })
      },
    })
},
 
searchBlue(){
    let that=this;
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success (res) {
        console.log(res);
        wx.showLoading({title: '正在搜索设备',}); 
        wx.getBluetoothDevices({
          success: function(res) {
            console.log(res);
            let devicesListArr=[];
            if(res.devices.length>0){ //如果有蓝牙就把蓝牙信息放到渲染列表里面
              wx.hideLoading();
              res.devices.forEach(device=>{
                if (!device.name && !device.localName) {
                  return
                }else{
                  devicesListArr.push(device);
                }
              })
              that.setData({devicesList:devicesListArr,isHideList:false}); //渲染到页面中
            }else{
              wx.hideLoading();
              wx.showModal({
                title: '温馨提示',
                content: '无法搜索到蓝牙设备，请打开GPS重新尝试',
                showCancel: false
              });
              wx.closeBluetoothAdapter({
                success (res) {
                    console.log(res)
                }
              })
            }
          }
        })
      },
      fail: function(res) {
        wx.showToast({
            title: '搜索蓝牙外围设备失败,请重新初始化蓝牙!',
            icon:'none',
        })
      }
    })
  },
  //开始连接，获取deviceId
  connectTo(e){
    let that=this;
    let deviceId=e.currentTarget.dataset.id; //设备id
    let connectName=e.currentTarget.dataset.name; //连接的设备名称
    wx.showLoading({title: '连接中...',});
    wx.createBLEConnection({
      deviceId,// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      success (res) {
        wx.hideLoading();
        that.stopBluetoothDevicesDiscovery(); //停止搜索蓝牙
        console.log(res);
        if(res.errCode==0){
          console.log('连接成功');
          that.setData({ 
              deviceId:deviceId,
              connectName:connectName,
              isHideConnect:false,
          })
          that.getBLEDeviceServices(deviceId); //获取已连接蓝牙的服务
        }else if(res.errCode==10012){
          wx.showToast({
            title: '连接超时，请重试！',
          })
        }
      },
      fail(error){
         wx.hideLoading();
          wx.showToast({
            title: error,
          })
      }
    });
  },
  //每个蓝牙都有数个服务，起到不同的功能，每个服务有独立的uuid
  //获取服务以及服务的uuid                                             
  getBLEDeviceServices(deviceId){   
    let serviceId;
    wx.getBLEDeviceServices({ //获取蓝牙设备所有服务
      deviceId, 
      success: (res) => { //services：设备服务列表 uuid：服务id
        console.log(res);
        serviceId=res.services[1].uuid;
        this.getBLEDeviceCharacteristics(deviceId, serviceId);
        
      },
    }) 
  },
  //每个服务都有特征值，特征值也有uuid，
  //获取特征值(是否能读写)
  getBLEDeviceCharacteristics(deviceId, serviceId) { 
    console.log(deviceId,'serviceId='+ serviceId)
    let that=this;
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log(res);
        let characteristicId=res.characteristics[0].uuid; //要写数据的特征id
        let writeNews={deviceId,serviceId,characteristicId};
        that.setData({writeNews:writeNews});
        let notifyId=res.characteristics[3].uuid;  //监听特征变化的特征id（接收数据）
        that.notifyBLECharacteristicValueChange(serviceId,notifyId); 
      },
      fail(err){
        console.log('获取特征值失败:');
        console.log(err)
      },
    });

  },
  writeBLECharacteristicValue(){ //页面有个按钮
    // 向蓝牙设备发送的16进制数据
     let that=this;
     let buffer = new ArrayBuffer(8);
     let dataView = new DataView(buffer);
     console.log(dataView);//第一个参数是字节序号，表示从哪个字节开始写入，第二个参数为写入的数据。
     let arr=that.data.queryData.query;
     arr.forEach((item,i)=>{
      dataView.setInt8(i, arr[i]);  
     })
     console.log(buffer)
     wx.writeBLECharacteristicValue({
       deviceId: that.data.writeNews.deviceId,
       serviceId: that.data.writeNews.serviceId,
       characteristicId:that.data.writeNews.characteristicId,
       value: buffer,
       success:(res)=>{
          console.log(res);
       },
       fail:(err)=>{
          console.log(err)
       }
     })
  },

  notifyBLECharacteristicValueChange(serviceId,characteristicId){
    let that=this;
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      deviceId: this.data.deviceId,
      serviceId,
      characteristicId,
      success (res) {
        console.log('notifyBLECharacteristicValueChange success');
        console.log(res);
        wx.onBLECharacteristicValueChange(function (res){
            console.log(res); 
            let str=that.ab2hex(res.value);
        
           
        })
      }
    })
  },


  //断开连接
  closeBLEConnection() { 
    let that=this;
    console.log(that.data)
   wx.closeBLEConnection({
     deviceId: this.data.deviceId,
     success(){
       wx.showToast({
         title: '已断开连接',
       });
       that.setData({
         deviceId:'',
         connectName:'',
         isHideConnect:true,
       });
     }
   })
   that.closeBluetoothAdapter();

 },

    // ArrayBuffer转16进制字符串
 ab2hex(buffer){
      var hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function (bit) {
          return ('00' + bit.toString(16)).slice(-2)
        }
      )
      return hexArr.join('');
},
 
 stopBluetoothDevicesDiscovery(){
  wx.stopBluetoothDevicesDiscovery({
    success (res) {
      console.log(res)
    }
  })
 },

  //关闭蓝牙模块
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter({
      success (res) {
        console.log('关闭蓝牙模块')
        that.setData({
          devicesList:[],
          isHideList:true,    //是否隐藏蓝牙列表
          isHideConnect:true, //是否隐藏连接模块
        })
      }
    })
  },



	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
  
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})