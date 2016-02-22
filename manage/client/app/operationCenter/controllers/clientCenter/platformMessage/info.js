'use strict';

var messageApp = angular.module('opCenterApp');
messageApp.controller('platformMessageEditCtrl', ['$scope', '$filter', 'dialog', 'clientCenterService', function ($scope, $filter, dialog, clientCenterService) {
    var vm = this;
    vm.message = {
        mid: '',   //编号（修改时必填）
        title: '',   //标题
        msgtype: '',  //消息类别(园区公告YQGG,平台公告PTGG)
        userids: '',   //发送对象
        content: '',   //消息内容
        times: 1,   //发布次数
        isrepeat: '',   //是否重复
        period: '',   //发布周期(天TT，周ZZ，月YY，季JJ，年NN)
        status: '',   //发布状态(草稿CG, 已发送YFS, 已回复YHF)
        creator: '', //发布人
        createtime: '',//发布日期
        updator: '',   //修改人
        updatetime: ''//发布日期
    };

    vm.defEName = "输入企业名称";
    //查询消息明细
    if ($scope.messageId) {
        clientCenterService.getMessageInfo($scope.messageId).then(function (response) {
            if (response.data && response.data.code == "200") {
                vm.message = response.data.body.message;
                vm.message.isrepeat = vm.message.isrepeat == 'Y' ? true : false;
                if(vm.message.userids && vm.message.userids != ""){
                    vm.defEName = vm.message.sendObjectsName;
                }
            }
        });
        vm.message.updator = user.userid;
        vm.message.updatetime = $filter('formatDate')(new Date());
    }
    else {
        vm.message.creator = user.userid;
        vm.message.createtime = $filter('formatDate')(new Date());
        vm.message.updator = user.userid;
        vm.message.updatetime = $filter('formatDate')(new Date());
    }

    //查询企业信息
    $scope.queryEnterpriseInfo = function(queryValue) {
        return clientCenterService.queryEnterpriseInfo(queryValue).then(function(response) {
            if (response.data && response.data.code == "200") {
                return response.data.body.data;
            }
        });
    }

    //保存消息
    $scope.saveMessage = function () {
        vm.message.status = 'CG';
        vm.message.isrepeat = vm.message.isrepeat ? 'Y' : 'N';
        if(vm.selectEnterprise && vm.selectEnterprise.enterpriseid !=""){
            vm.message.userids = vm.selectEnterprise.enterpriseid;
            vm.message.sendObjectsName = vm.selectEnterprise.enterprisename;
        }
        clientCenterService.saveOrUpdateMessage(vm.message).then(function (response) {
            if (response.data && response.data.code == "200") {
                dialog.notify('保存消息成功！', 'success');
                $scope.messageForm.submitted = true;
                $scope.closeThisDialog(true);
            }
            else {
                dialog.notify(response.data.msg, 'error');
                $scope.closeThisDialog(false);
            }
        });
    };

    //消息发布
    $scope.sendMessage = function () {
        vm.message.status = 'YFS';
        vm.message.isrepeat = vm.message.isrepeat ? 'Y' : 'N';
        if(vm.selectEnterprise && vm.selectEnterprise.enterpriseid !=""){
            vm.message.userids = vm.selectEnterprise.enterpriseid;
            vm.message.sendObjectsName = vm.selectEnterprise.enterprisename;
        }
        clientCenterService.saveOrUpdateMessage(vm.message).then(function (response) {
            if (response.data && response.data.code == "200") {
                dialog.notify('保存消息成功！', 'success');
                $scope.messageForm.submitted = true;
                $scope.closeThisDialog(true);
            }
            else {
                dialog.notify(response.data.msg, 'error');
                $scope.closeThisDialog(false);
            }
        });
    };

    //消息回复列表
    $scope.getReplyList = function(){
        clientCenterService.getMessageInfo($scope.viewMId).then(function (response) {
            if (response.data && response.data.code == "200") {
                vm.message = response.data.body.message;
                $scope.replys = response.data.body.reply;
            }
        });
    }

    //消息回复
    $scope.replyMessage = function(){
        vm.rmJson.mid = $scope.viewMId;
        vm.rmJson.replyid = user.userid;
        // vm.rmJson.replytime = vm.getDateTime();
        vm.rmJson.datasource = user.datasource;
        if($scope.myForm.$valid){
            clientCenterService.replyMessage(vm.rmJson).then(function (response) {
                if(response.data.code == "200"){
                    vm.rmJson.replycontent = "";
                    $scope.myForm.submitted = false;
                    $scope.getReplyList();
                }
            });
        }
        $scope.myForm.submitted = true;
    }

    //获取客户端系统时间
    vm.getDateTime = function(){
        var now = new Date();
        var year = now.getFullYear();       //年
        var month = now.getMonth() + 1;     //月
        var day = now.getDate();            //日
        var hh = now.getHours();            //时
        var mm = now.getMinutes();          //分
        var ss = now.getSeconds();          //秒

        var clock = year + "-";
        if(month < 10) clock += "0";
        clock += month + "-";
        if(day < 10) clock += "0";
        clock += day + " ";
        if(hh < 10)
        clock += "0";
        clock += hh + ":";
        if (mm < 10) clock += '0'; 
        clock += mm + ":";      
        if (ss < 10) clock += '0'; 
        clock += ss; 
        return(clock); 
    }

    //取消
    $scope.cancel = function () {
        $scope.closeThisDialog(null);
    };

    if ($scope.viewMId) {
        $scope.getReplyList();
    }
}]);