import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  plugins: [vue(), svgLoader(), AddJustFont(mode)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 2405,
  },
}))

interface HtmlTagDescriptor {
  tag: string
  attrs?: Record<string, string>
  children?: string | HtmlTagDescriptor[]
  /**
   * default： 'head-prepend'
   */
  injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
}
function AddJustFont(mode: string) {
  return {
    name: 'html-transform',
    transformIndexHtml(): HtmlTagDescriptor[] {
      // staging:  <script src="//s3-ap-northeast-1.amazonaws.com/justfont-user-script/jf-65386.js"></script>
      return mode === 'production'
        ? [
            {
              tag: 'script',
              attrs: { type: 'text/javascript' },
              children: `var _jf = _jf || [];_jf.push(['p','65386']);_jf.push(['initAction',true]);_jf.push(['_setFont','jf-openhuninn','css','.jf-openhuninn']);_jf.push(['_setFont','jf-openhuninn','alias','jf-openhuninn']);_jf.push(['_setFont','jf-openhuninn','weight',400]);(function(A,p,c,m,l,q,r,h,B,D){var b=A._jf;if(b.constructor!==Object){var t=!0,u=function(a){var f=!0,e;for(e in b)b[e][0]==a&&(f&&(f=f&&!1!==b[e][1].call(b)),b[e]=null,delete b[e])},v=/\\S+/g,w=/[\\t\\r\\n\\f]/g,C=/^[\\s\\uFEFF\\xA0]+|[\\s\\uFEFF\\xA0]+$/g,n="".trim,x=n&&!n.call("\\ufeff\\u00a0")?function(a){return null==a?"":n.call(a)}:function(a){return null==a?"":(a+"").replace(C,"")},k=function(a){var f,b,g;if("string"===typeof a&&a&&(a=(a||"").match(v)||[],f=h[c]?(" "+h[c]+" ").replace(w," "):" ")){for(g=0;b=a[g++];)0>f.indexOf(" "+b+" ")&&(f+=b+" ");h[c]=x(f)}},d=function(a){var b,e,g;if(0===arguments.length||"string"===typeof a&&a){var d=(a||"").match(v)||[];if(b=h[c]?(" "+h[c]+" ").replace(w," "):""){for(g=0;e=d[g++];)for(;0<=b.indexOf(" "+e+" ");)b=b.replace(" "+e+" "," ");h[c]=a?x(b):""}}},y;b.addScript=y=function(b,f,e,g,d,c){d=d||function(){};c=c||function(){};var a=p.createElement("script"),h=p.getElementsByTagName("script")[0],k,m=!1,l=function(){a.src="";a.parentNode.removeChild(a);a=a.onerror=a.onload=a.onreadystatechange=null};g&&(k=setTimeout(function(){l();c()},g));a.type=f||"text/javascript";a.async=e;a.onload=a.onreadystatechange=function(b,c){m||a.readyState&&!/loaded|complete/.test(a.readyState)||(m=!0,g&&clearTimeout(k),l(),c||d())};a.onerror=function(a,b,d){g&&clearTimeout(k);l();c();return!0};a.src=b;h.parentNode.insertBefore(a,h)};for(var z in b)"initAction"==b[z][0]&&(t=b[z][1]);b.push(["_eventPreload",function(){1==t&&k(m);y(B,null,!1,3E3,null,function(){u("_eventInactived")})}]);b.push(["_eventReload",function(){d(r);d(q);k(l)}]);b.push(["_eventActived",function(){d(m);d(l);k(q)}]);b.push(["_eventInactived",function(){d(m);d(l);k(r)}]);u("_eventPreload")}})(this,this.document,"className","jf-loading","jf-reloading","jf-active","jf-inactive",this.document.getElementsByTagName("html")[0],"//ds.justfont.com/js/stable/v/6.1/id/411254790256");`,
              injectTo: 'head',
            },
          ]
        : [
            {
              tag: 'script',
              attrs: { src: '//s3-ap-northeast-1.amazonaws.com/justfont-user-script/jf-65386.js' },
              injectTo: 'head',
            },
          ]
    },
  }
}
