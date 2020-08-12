import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgcCookieConsentService, NgcStatusChangeEvent } from 'ngx-cookieconsent';
import { Subscription }   from 'rxjs/Subscription';
import { PodcastService } from 'src/app/services/podcast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConstNameService } from 'src/app/services/const-name.service';
import { ActivatedRoute, Router } from '@angular/router';
import postscribe from 'postscribe';

declare let $: any;

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {

   private statusChangeSubscription: Subscription;

  constructor(
    private podcastService: PodcastService,
    private constname: ConstNameService,
    private router: Router,
    private ccService: NgcCookieConsentService
  ) { }

  ngOnInit() {
    this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
      (event: NgcStatusChangeEvent) => {
        if(event.status === "allow") {
          $("#adswizz_1").attr("src", "//synchrobox.adswizz.com/register2.php?aw_0_req.gdpr=true");
          $("#adswizz_2").attr("src", "//cdn.adswizz.com/adswizz/js/SynchroClient2.js?aw_0_req.gdpr=true");
          localStorage.setItem('isAccept', "allow");
        } else {
          localStorage.setItem('isAccept', "decline");
          $("#adswizz_1").attr("src", "//synchrobox.adswizz.com/register2.php?aw_0_req.gdpr=false");
          $("#adswizz_2").attr("src", "//cdn.adswizz.com/adswizz/js/SynchroClient2.js?aw_0_req.gdpr=false");
        }
    });
  }

  onActivate(event) {
   let scrollToTop = window.setInterval(() => {
     let pos = window.pageYOffset;
     if (pos > 0) {
       window.scrollTo(0, pos - 20); // how far to scroll on each step
     } else {
       window.clearInterval(scrollToTop);
     }
   }, 16);
  }

  ngOnDestroy() {
    this.statusChangeSubscription.unsubscribe();
  }
}
