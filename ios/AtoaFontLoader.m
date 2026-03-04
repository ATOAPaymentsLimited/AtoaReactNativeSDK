#import <Foundation/Foundation.h>
#import <CoreText/CoreText.h>

__attribute__((constructor))
static void AtoaLoadFonts(void) {
    NSBundle *classBundle = [NSBundle bundleForClass:NSClassFromString(@"AtoaAppInstalled")];
    if (!classBundle) {
        classBundle = [NSBundle mainBundle];
    }

    // Fonts are in the AtoaReactNativeSdkFonts resource bundle (set in podspec)
    NSURL *resourceBundleURL = [classBundle URLForResource:@"AtoaReactNativeSdkFonts" withExtension:@"bundle"];
    NSBundle *fontBundle = resourceBundleURL ? [NSBundle bundleWithURL:resourceBundleURL] : classBundle;

    NSArray<NSString *> *fontNames = @[@"Figtree", @"Figtree_bold"];
    for (NSString *fontName in fontNames) {
        NSURL *fontURL = [fontBundle URLForResource:fontName withExtension:@"ttf"];
        if (fontURL) {
            CTFontManagerRegisterFontsForURL((__bridge CFURLRef)fontURL, kCTFontManagerScopeProcess, NULL);
        }
    }
}
