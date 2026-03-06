#import <Foundation/Foundation.h>
#import <CoreText/CoreText.h>

// Helper class used solely to locate the correct bundle for this pod.
// NSClassFromString(@"AtoaAppInstalled") fails under use_frameworks!
// because Swift classes require module-qualified names.
@interface AtoaFontLoaderAnchor : NSObject
@end

@implementation AtoaFontLoaderAnchor
@end

__attribute__((constructor))
static void AtoaLoadFonts(void) {
    NSBundle *classBundle = [NSBundle bundleForClass:[AtoaFontLoaderAnchor class]];

    // Fonts are in the AtoaReactNativeSdkFonts resource bundle (set in podspec)
    NSURL *resourceBundleURL = [classBundle URLForResource:@"AtoaReactNativeSdkFonts" withExtension:@"bundle"];
    NSBundle *fontBundle = resourceBundleURL ? [NSBundle bundleWithURL:resourceBundleURL] : classBundle;

    NSArray<NSString *> *fontNames = @[@"Figtree", @"Figtree_medium", @"Figtree_semibold", @"Figtree_bold"];
    for (NSString *fontName in fontNames) {
        NSURL *fontURL = [fontBundle URLForResource:fontName withExtension:@"ttf"];
        if (fontURL) {
            CTFontManagerRegisterFontsForURL((__bridge CFURLRef)fontURL, kCTFontManagerScopeProcess, NULL);
        }
    }
}
