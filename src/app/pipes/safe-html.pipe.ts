import { Sanitizer, Pipe, SecurityContext, PipeTransform } from '@angular/core';

@Pipe({name: 'safeHtml'})

export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: Sanitizer) {
  }

  transform(text) {
    return this.sanitizer.sanitize(SecurityContext.HTML, text);
  }
}
