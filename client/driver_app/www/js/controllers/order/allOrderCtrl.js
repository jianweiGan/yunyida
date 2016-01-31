'use strict';

angular.module('starter.controllers').controller('AllOrderCtrl', function ($scope, $http, $timeout, $ionicModal, $ionicLoading, $ionicHistory, $ionicPopover,$ionicPopup,$ionicSideMenuDelegate, $state, $stateParams, UserInfo) {
  $scope.backGo = function () {
    $ionicHistory.goBack();
  };

  $scope.showMsg = function (txt) {
    var template = '<ion-popover-view style = "background-color:#ef473a !important" class = "light padding" > ' + txt + ' </ion-popover-view>';
    $scope.popover = $ionicPopover.fromTemplate(template, {
      scope: $scope
    });
    $scope.popover.show();
    $timeout(function () {
      $scope.popover.hide();
    }, 1000);
  }

  $scope.orderList = [];
  $scope.load_over = true;
  $scope.pulltextchange = '下拉刷新';

  $scope.flag = {
    showDelete: false
  };

  $scope.query = {
    page: 1,
    rows: 8,
    orderStatus:'',
    userId: UserInfo.data.userId
  };

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  //下拉刷新
  $scope.doRefresh = function () {
    $scope.orderList = [];
    $scope.query.page = 1;
    $scope.load_over = true;
    $scope.loadMore();
    // 停止广播ion-refresher
    $scope.$broadcast('scroll.refreshComplete');
    $scope.pulltextchange = '下拉刷新';
  };

  $scope.pulltext = function () {
    $timeout(function () {
      $scope.pulltextchange = '刷新订单';
    })
  };
  //更多
  $scope.loadMore = function () {
    //这里使用定时器是为了缓存一下加载过程，防止加载过快
    $timeout(function () {
      io.socket.get('/order/userOrder', $scope.query, function serverResponded(body, JWR) {
        if (JWR.statusCode !== 200) {
          $scope.showMsg('请求失败,网络不给力！');
        }
        else {
          if (body.length > 0) {
            $scope.orderList = $scope.orderList.concat(body);
            $scope.query.page++;
            $scope.$broadcast("scroll.infiniteScrollComplete");
          }
          else {
            $scope.load_over = false;
            $scope.orderList = $scope.orderList.concat([]);
            $scope.$broadcast("scroll.infiniteScrollComplete");
          }
        }
      });
    }, 800);
  };

  $scope.orderFilter=function(orderStatus){
    $scope.query.orderStatus=orderStatus;
    $scope.doRefresh();
    $scope.toggleLeft();
  }

  //查看订单详情
  $scope.orderDetail = function (item) {
    $scope.orderItem = item;
    $scope.detail.show();
  }

  //触发弹出层事件
  $ionicModal.fromTemplateUrl('templates/order/allOrderDetail.html ', {
    scope: $scope
  }).then(function (detail) {
    $scope.detail = detail;
  });
  //关闭订单详情
  $scope.closeDetail = function () {
    $scope.detail.hide();
  };

  //取消订单
  $scope.cancelOrder = function (orderId) {
    var confirmPopup = $ionicPopup.confirm({
      title: '取消订单',
      template: '您确定要取消订单吗?',
      buttons: [
        { text: '暂不取消',onTap: function(e) {return false;}},
        { text: '确定',type: 'button-assertive',onTap: function(e) {return true;}}
      ]
    });
    confirmPopup.then(function(res) {
      if(res) {
        io.socket.post('/order/cancelOrder', {orderId: orderId}, function serverResponded(body, JWR) {
          if (JWR.statusCode !== 200) {
            $scope.showMsg('请求失败,网络不给力！');
          }
          else {
            for (var i = 0; i < $scope.orderList.length; i++) {
              if ($scope.orderList[i].goodsOrderId == body.goodsOrderId) {
                $scope.orderList[i] = body;
                if ($scope.orderItem) {
                  $scope.orderItem = body;
                }
              }
            }
          }
        });
      }});
  }

  //重新发布订单
  $scope.refreshOrder = function (orderId) {
    if($scope.orderItem&&$scope.orderItem.goods.goodsType=='指定发货')
    {
      var confirmPopup = $ionicPopup.confirm({
        title: '重新发布订单',
        template: '此订单即转化为随机发货订单，是否继续?',
        buttons: [
          { text: '暂不发布',onTap: function(e) {return false;}},
          { text: '确定',type: 'button-assertive',onTap: function(e) {return true;}}
        ]
      });
      confirmPopup.then(function(res) {
        if(res) {
          io.socket.post('/order/refreshOrder', {orderId: orderId}, function serverResponded(body, JWR) {
            if (JWR.statusCode !== 200) {
              $scope.showMsg('请求失败,网络不给力！');
            }
            else {
              for (var i = 0; i < $scope.orderList.length; i++) {
                if ($scope.orderList[i].goodsOrderId == body.goodsOrderId) {
                  $scope.orderList[i] = body;
                  if ($scope.orderItem) {
                    $scope.orderItem = body;
                  }
                }
              }
            }
          });
        }
      });
    }
    else{
      var confirmPopup = $ionicPopup.confirm({
        title: '重新发布订单',
        template: '您确定要重新发布订单吗?',
        buttons: [
          { text: '暂不发布',onTap: function(e) {return false;}},
          { text: '确定',type: 'button-assertive',onTap: function(e) {return true;}}
        ]
      });
      confirmPopup.then(function(res) {
        if(res) {
          io.socket.post('/order/refreshOrder', {orderId: orderId}, function serverResponded(body, JWR) {
            if (JWR.statusCode !== 200) {
              $scope.showMsg('请求失败,网络不给力！');
            }
            else {
              for (var i = 0; i < $scope.orderList.length; i++) {
                if ($scope.orderList[i].goodsOrderId == body.goodsOrderId) {
                  $scope.orderList[i] = body;
                  if ($scope.orderItem) {
                    $scope.orderItem = body;
                  }
                }
              }
            }
          });
        }
      });
    }
  }

  //删除订单
  $scope.deleteOrder = function (orderId) {
    var confirmPopup = $ionicPopup.confirm({
      title: '删除订单',
      template: '您确定要删除订单吗?',
      buttons: [
        { text: '取消',onTap: function(e) {return false;}},
        { text: '确定',type: 'button-assertive',onTap: function(e) {return true;}}
        ]
    });
    confirmPopup.then(function(res) {
      if(res) {
        io.socket.post('/order/deleteOrder', {orderId: orderId}, function serverResponded(body, JWR) {
          if (JWR.statusCode !== 200) {
            $scope.showMsg('请求失败,网络不给力！');
          }
          else {
            for (var i = 0; i < $scope.orderList.length; i++) {
              if ($scope.orderList[i].goodsOrderId == body.goodsOrderId) {
                if (body.status) {
                  $scope.orderList[i] = body;
                }
                else {
                  $scope.orderList.splice(i, 1);
                  if ($scope.orderItem) {
                    $scope.closeDetail();
                  }
                  $timeout(function(){
                    $scope.flag.showDelete=false;
                  });
                }
              }
            }
          }
        });
      }
    });
  }

  var fentip = ["很差", "一般", "好", "很好", "非常好"];
  $scope.isPMouseEnter = false;
  $scope.selectPeople = 0;
  $scope.msgPeople = "请给此项打分";

  $scope.evaluateData = {
    orderId: '',
    evaluationLevel: '',
    evaluationContent: ''
  };

  //订单评价
  $scope.orderEvaluate = function (orderId) {
    $scope.evaluateData.orderId = orderId;
    $scope.evaluate.show();
  }

  //触发弹出层事件
  $ionicModal.fromTemplateUrl('templates/order/evaluateOrder.html ', {
    scope: $scope
  }).then(function (detail) {
    $scope.evaluate = detail;
  });
  //关闭订单评价
  $scope.closeEvaluate = function () {
    $scope.evaluate.hide();
  };

  $scope.evaluatePeopleClass = function (num) {
    var rtnClass = "";
    if ($scope.isPMouseEnter) {
      if ($scope.selectPeople >= num) {
        rtnClass = "stared";
      }
      else {
        rtnClass = "star";
      }
    }
    else {
      if ($scope.evaluateData.evaluationLevel>= num) {
        rtnClass = "stared";
      }
      else {
        rtnClass = "star";
      }
    }
    return rtnClass;
  }

  $scope.evaluatePeopleClick = function (num) {
    $scope.evaluateData.evaluationLevel = num;
    $scope.msgPeople = fentip[num - 1];
  }

  $scope.peopleMouseEnter = function (num) {
    $scope.selectPeople = num;
    $scope.isPMouseEnter = true;
    $scope.msgPeople = fentip[num - 1];
  }

  $scope.peopleMouseLeave = function (num) {
    $scope.selectPeople = num;
    $scope.isPMouseEnter = false;
    if ($scope.evaluateData.evaluationLevel> 0) {
      $scope.msgPeople = fentip[$scope.evaluateData.evaluationLevel- 1];
    }
    else {
      $scope.msgPeople = "请给此项打分";
    }
  }

  //评价
  $scope.evaluateSubmit = function () {
    if (!$scope.evaluateData.evaluationLevel) {
      $scope.showMsg("请进行满意度评分");
      return;
    }

    io.socket.post('/order/evaluateOrder', $scope.evaluateData, function serverResponded(body, JWR) {
      if (JWR.statusCode !== 200) {
        $scope.showMsg('请求失败,网络不给力！');
      }
      else {
        for (var i = 0; i < $scope.orderList.length; i++) {
          if ($scope.orderList[i].goodsOrderId == body.goodsOrderId) {
            if (body.status) {
              $scope.orderList[i] = body;
              $scope.showMsg('感谢您的评价!');
              $scope.closeEvaluate();
            }
          }
        }
      }
    });
  }


  //$scope.doRefresh();

});