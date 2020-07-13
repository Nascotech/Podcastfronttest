import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { PodcastService } from 'src/app/services/podcast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConstNameService } from 'src/app/services/const-name.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import postscribe from 'postscribe';

import * as $ from "jquery";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  photoUrl: string;
  searchText: string;
  searchGroup: string;
  dataResponse: any = [];
  lastPage;
  count: number = 1;
  podcastList: any = [];
  isFullListDisplayed: boolean = false;
  groupDataResponse: any = [];
  groupList: any;
  isloadmore: boolean = false;
  submitted = false;
  isLoadingService:boolean = true;
  userResponse: any = [];
  errorMessage: string;
  validationMessage = [];
  advScriptData: any = [];

  constructor(
    private podcastService: PodcastService,
    private constname: ConstNameService,
    private router: Router,
    private _renderer2: Renderer2,
    private titleService: Title
  ) { }

  ngOnInit() {
    window.scroll(0,0);
    this.getAdvScript();
    this.getAccessToken();
  }

  searchPodcast() {
    this.podcastList = [];
    this.getPodcastlist();
  }

  clearSearch() {
    this.podcastList = [];
    this.searchText = '';
    this.getPodcastlist();
  }

  getAccessToken() {
    this.photoUrl = this.constname.BASE.img_uri;
    let domain = location.protocol + '//' + location.hostname;
    //let domain = 'https://atunwapodcasts.com';
    this.podcastService.getAccessToken(domain).subscribe((data: any) => {
      if (data.errorMsg === "")  {
        this.userResponse = data;
        if(this.userResponse.response.photo) {
          $(".header-logo").attr("src", this.photoUrl + this.userResponse.response.photo.path);
        }
        if(this.userResponse.response.homeDomain) {
          $("#home-link").attr("href", this.userResponse.response.homeDomain);
        }
        document.documentElement.style.setProperty('--primary-color', this.userResponse.response.headerColor);
        this.titleService.setTitle("Podcasts - " + this.userResponse.response.publisherName);
        localStorage.setItem('publisherInfo', JSON.stringify(this.userResponse.response));
        localStorage.setItem('publisherToken', this.userResponse.response.accessToken);
        localStorage.setItem('themeColor', this.userResponse.response.headerColor);
        this.getGroupList();
        this.getPodcastlist();
      } else if (data.errorMsg === "ValidationError") {
        let messages = data.response.message;
        if (messages.length > 1) {
          this.validationMessage = messages;
        } else {
          this.errorMessage = data.response.message;
        }
      } else {
        this.errorMessage = data.errorMsg;
      }
    }, (error: HttpErrorResponse) => {
       if (error.status === 0) {
         this.errorMessage = "Server can't be connect try again.";
       } else {
         this.constname.forbidden(error);
         this.errorMessage = error.error.errorMsg;
       }
    });
  }

  async updateGoogleScript() {
    if(this.advScriptData.leaderboard1 && !$("#lead-banner").find("script").length){
      await postscribe('#lead-banner', atob(this.advScriptData.leaderboard1));
    }
    if(this.advScriptData.sidebar1 && !$("#sidebar1").find("script").length) {
      await postscribe('#sidebar1', atob(this.advScriptData.sidebar1));
    }
    if(this.advScriptData.sidebar2 && !$("#sidebar2").find("script").length){
      await postscribe('#sidebar2', atob(this.advScriptData.sidebar2));
    }
    if(this.advScriptData.sidebar3 && !$("#sidebar3").find("script").length){
      await postscribe('#sidebar3', atob(this.advScriptData.sidebar3));
    }
    if(this.advScriptData.sidebar4 && !$("#sidebar4").find("script").length){
      await postscribe('#sidebar4', atob(this.advScriptData.sidebar4));
    }
  }

  getAdvScript() {
    this.podcastService.getDefaultSetting().subscribe((data: any) => {
      this.advScriptData = data.response;
      localStorage.setItem('advScriptData', JSON.stringify(this.advScriptData));
      this.updateGoogleScript();
    }, (error: HttpErrorResponse) => {
      this.constname.forbidden(error);
    });
  }

  getGroupList() {
    this.podcastService.getGroupList(1).subscribe(data => {
      this.groupDataResponse = data;
      this.isloadmore = true;
      this.groupList = this.groupDataResponse.response.data;
    }, (error: HttpErrorResponse) => {
      this.constname.forbidden(error);
    });
  }

  groupFilter(event) {
    this.podcastList = [];
    this.searchGroup = event.target.value;;
    this.getPodcastlist();
  }

  gotodirectoryPage() {
    console.log("vhvh");
  }

  getPodcastlist() {
    this.isLoadingService = true;
    this.count = 1;
    this.podcastService.getPodcastList(1, this.searchGroup, this.searchText).subscribe(data => {
      this.isloadmore=true;
      this.dataResponse = data;
      this.isLoadingService = false;
      this.podcastList = this.dataResponse.response.list;
      let totalRecord = this.dataResponse.response.total;
      this.lastPage = Math.ceil(totalRecord / 24);
      if(this.lastPage > 1) {
        $('#more-podcast-btn').show();
      }
      this.isLoadingService = false;
    }, (error: HttpErrorResponse) => {
      this.constname.forbidden(error);
      this.isLoadingService = false;
    });
  }

  gotodetailPage(id) {
    this.router.navigate(['/directory'+id])
  }

  loadMorePodcast() {
    this.count++;
    this.submitted=true;
    if(this.count <= this.lastPage) {
      //this.ngxService.start();
      this.podcastService.getPodcastList(this.count, this.searchGroup, this.searchText).subscribe(data => {
        this.dataResponse = data;
        this.submitted=false;
        this.isloadmore=true;
        this.dataResponse.response.list.forEach(item => {
          this.podcastList.push(item);
        });
        //this.ngxService.stop();
      }, (error: HttpErrorResponse) => {
        this.submitted=false;
        this.constname.forbidden(error);
       // this.ngxService.stop();
      });
    } else {
      this.isFullListDisplayed = true;
    }
  }
}
