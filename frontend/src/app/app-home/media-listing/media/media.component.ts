import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Media } from 'src/app/Models/Media';
import { Product } from 'src/app/Models/Product';


@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit {
 @Input() mediaImageData: any;
  @Input() product: Product;
  
  ngOnInit(): void {
    console.log("Product in media component:", this.product)
  }
  
}
