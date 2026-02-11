#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AtoaAppInstalled, NSObject)

RCT_EXTERN_METHOD(isAppInstalled:(NSString *)urlScheme
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
