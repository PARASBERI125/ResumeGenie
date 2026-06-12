$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$outPath = Join-Path $root "ResumeGenie_Final_Assessment_Presentation.pptx"
$workDir = Join-Path $root ".presentation-build"
$imageSource = "C:\Users\Paras Beri\AppData\Local\Temp\ai-chat-attachment-252175990904884016.png"

if (Test-Path -LiteralPath $workDir) {
    Remove-Item -LiteralPath $workDir -Recurse -Force
}
if (Test-Path -LiteralPath $outPath) {
    Remove-Item -LiteralPath $outPath -Force
}

New-Item -ItemType Directory -Force -Path `
    (Join-Path $workDir "_rels"), `
    (Join-Path $workDir "docProps"), `
    (Join-Path $workDir "ppt\_rels"), `
    (Join-Path $workDir "ppt\slides\_rels"), `
    (Join-Path $workDir "ppt\slideMasters\_rels"), `
    (Join-Path $workDir "ppt\slideLayouts\_rels"), `
    (Join-Path $workDir "ppt\slideMasters"), `
    (Join-Path $workDir "ppt\slideLayouts"), `
    (Join-Path $workDir "ppt\theme"), `
    (Join-Path $workDir "ppt\slides"), `
    (Join-Path $workDir "ppt\media") | Out-Null

Copy-Item -LiteralPath $imageSource -Destination (Join-Path $workDir "ppt\media\architecture.png") -Force

function Write-Utf8File {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )
    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Escape-Xml {
    param([string]$Text)
    return [System.Security.SecurityElement]::Escape($Text)
}

function Emu {
    param([double]$Inches)
    return [int][Math]::Round($Inches * 914400)
}

$script:shapeId = 2

function TextBox {
    param(
        [double]$X,
        [double]$Y,
        [double]$W,
        [double]$H,
        [string[]]$Lines,
        [int]$FontSize = 24,
        [string]$Color = "24324A",
        [switch]$Bold,
        [string]$Align = "l"
    )

    $id = $script:shapeId
    $script:shapeId++
    $paragraphs = foreach ($line in $Lines) {
        $safe = Escape-Xml $line
        "<a:p><a:pPr algn=`"$Align`"/><a:r><a:rPr lang=`"en-US`" sz=`"$($FontSize * 100)`" dirty=`"0`" b=`"$([int]$Bold.IsPresent)`"><a:solidFill><a:srgbClr val=`"$Color`"/></a:solidFill><a:latin typeface=`"Aptos Display`"/></a:rPr><a:t>$safe</a:t></a:r></a:p>"
    }

    return @"
<p:sp>
  <p:nvSpPr><p:cNvPr id="$id" name="TextBox $id"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="$(Emu $X)" y="$(Emu $Y)"/><a:ext cx="$(Emu $W)" cy="$(Emu $H)"/></a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    <a:noFill/>
    <a:ln><a:noFill/></a:ln>
  </p:spPr>
  <p:txBody>
    <a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0"/>
    <a:lstStyle/>
    $($paragraphs -join "`n")
  </p:txBody>
</p:sp>
"@
}

function Card {
    param(
        [double]$X,
        [double]$Y,
        [double]$W,
        [double]$H,
        [string]$Fill,
        [string]$Stroke = "D7DEE8"
    )
    $id = $script:shapeId
    $script:shapeId++
    return @"
<p:sp>
  <p:nvSpPr><p:cNvPr id="$id" name="Card $id"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="$(Emu $X)" y="$(Emu $Y)"/><a:ext cx="$(Emu $W)" cy="$(Emu $H)"/></a:xfrm>
    <a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom>
    <a:solidFill><a:srgbClr val="$Fill"/></a:solidFill>
    <a:ln w="12700"><a:solidFill><a:srgbClr val="$Stroke"/></a:solidFill></a:ln>
  </p:spPr>
</p:sp>
"@
}

function Picture {
    param(
        [double]$X,
        [double]$Y,
        [double]$W,
        [double]$H,
        [string]$RelId = "rId2"
    )
    $id = $script:shapeId
    $script:shapeId++
    return @"
<p:pic>
  <p:nvPicPr><p:cNvPr id="$id" name="architecture.png"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>
  <p:blipFill><a:blip r:embed="$RelId"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
  <p:spPr>
    <a:xfrm><a:off x="$(Emu $X)" y="$(Emu $Y)"/><a:ext cx="$(Emu $W)" cy="$(Emu $H)"/></a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
  </p:spPr>
</p:pic>
"@
}

function Make-Slide {
    param(
        [string]$Body,
        [string]$Background = "F7FAFC"
    )
    return @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="$Background"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      $Body
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>
"@
}

function SlideRel {
    param([switch]$WithImage)
    $imageRel = ""
    if ($WithImage) {
        $imageRel = '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/architecture.png"/>'
    }
    return @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  $imageRel
</Relationships>
"@
}

$slides = @()

$script:shapeId = 2
$body1 = @(
    Card 0.55 0.45 12.25 6.55 "EAF6FF" "B6DDFC"
    TextBox 1.05 1.15 11.2 1.0 @("ResumeGenie") 52 "0F2742" -Bold -Align "ctr"
    TextBox 1.35 2.25 10.6 0.55 @("AI Powered Resume Builder and Assistant") 24 "31435F" -Align "ctr"
    TextBox 2.05 3.55 9.2 0.55 @("Presented by: Paras Beri") 26 "162033" -Bold -Align "ctr"
    TextBox 2.05 4.25 9.2 0.45 @("Final Assessment Presentation") 20 "475569" -Align "ctr"
) -join "`n"
$slides += Make-Slide $body1 "F7FAFC"

$script:shapeId = 2
$body2 = @(
    TextBox 0.65 0.42 12.0 0.55 @("Introduction") 34 "10233F" -Bold
    TextBox 0.8 1.15 11.8 0.8 @("ResumeGenie is a full-stack application that helps users create, improve, preview, and manage professional resumes using AI assistance.") 22 "334155"
    Card 0.85 2.25 5.7 1.15 "FFFFFF"
    TextBox 1.15 2.48 5.15 0.65 @("React frontend: dashboard, resume editor, preview, login, AI tools.") 18 "24324A"
    Card 6.8 2.25 5.7 1.15 "FFFFFF"
    TextBox 7.1 2.48 5.15 0.65 @("Spring Boot backend: API Gateway, Auth Service, Resume Service, AI Genie Service.") 18 "24324A"
    Card 0.85 3.85 5.7 1.15 "FFFFFF"
    TextBox 1.15 4.08 5.15 0.65 @("AI support: generates resumes, rewrites sections, and parses uploaded PDF resumes.") 18 "24324A"
    Card 6.8 3.85 5.7 1.15 "FFFFFF"
    TextBox 7.1 4.08 5.15 0.65 @("Data layer: MySQL for users, MongoDB for resumes, vector DB for resume standards context.") 18 "24324A"
) -join "`n"
$slides += Make-Slide $body2

$script:shapeId = 2
$body3 = @(
    TextBox 0.65 0.42 12.0 0.55 @("Why I Made This Project") 34 "10233F" -Bold
    Card 0.8 1.25 5.85 5.45 "FFF5F2" "F5B8A8"
    TextBox 1.15 1.55 5.1 0.45 @("Existing Problems") 24 "9A3412" -Bold
    TextBox 1.15 2.18 5.1 3.2 @(
        "- Many students do not know the correct resume structure.",
        "- Writing strong bullet points takes time.",
        "- Normal resume tools often feel generic.",
        "- Updating, storing, and previewing resumes can become messy.",
        "- Existing resumes are hard to convert into editable structured data."
    ) 18 "334155"
    Card 6.9 1.25 5.85 5.45 "F0FDF4" "9AD7B3"
    TextBox 7.25 1.55 5.1 0.45 @("How ResumeGenie Solves It") 24 "166534" -Bold
    TextBox 7.25 2.18 5.1 3.5 @(
        "- Builds a complete resume from simple rough notes.",
        "- Rewrites sections based on the target role.",
        "- Lets users upload a PDF and convert it into editable resume data.",
        "- Saves resumes securely and supports create, edit, delete, preview, and download.",
        "- Uses AI with resume-standard context for more useful output."
    ) 18 "334155"
) -join "`n"
$slides += Make-Slide $body3

$script:shapeId = 2
$body4 = @(
    TextBox 0.65 0.3 12.0 0.5 @("Architecture Diagram") 32 "10233F" -Bold
    Picture 0.5 1.05 12.35 5.63
    TextBox 0.85 6.85 11.8 0.28 @("This diagram shows how the frontend, gateway, microservices, databases, vector DB, and Groq cloud work together.") 13 "475569" -Align "ctr"
) -join "`n"
$slides += Make-Slide $body4 "FFFFFF"

$script:shapeId = 2
$body5 = @(
    TextBox 0.65 0.42 12.0 0.55 @("Architecture Explanation") 34 "10233F" -Bold
    Card 0.75 1.18 12.0 5.95 "FFFFFF" "D7DEE8"
    TextBox 1.1 1.55 11.3 4.8 @(
        "1. The React frontend is the user interface where the user logs in, creates resumes, edits sections, uploads PDF files, and previews the final resume.",
        "2. All frontend requests first go to the API Gateway. The gateway acts as the single entry point and handles routing, authentication checks, and traffic control.",
        "3. Auth Service manages registration and login. It uses BCrypt for password security, JWT for authenticated requests, and MySQL for user data.",
        "4. Resume Service stores and manages resume information like education, work experience, projects, skills, and achievements in MongoDB.",
        "5. AI Genie Service uses Spring AI and Groq models to generate full resumes, rewrite weak sections, parse PDFs, and use vector database context for resume standards.",
        "6. This microservice design keeps each responsibility separate, making the project easier to maintain and extend."
    ) 17 "334155"
) -join "`n"
$slides += Make-Slide $body5

$script:shapeId = 2
$body6 = @(
    TextBox 0.65 0.42 12.0 0.55 @("Future Advancements") 34 "10233F" -Bold
    Card 0.8 1.25 3.85 2.05 "EEF8FF" "B6DDFC"
    TextBox 1.1 1.55 3.25 1.25 @("More Resume Templates", "Add multiple professional templates with different colors, layouts, and role-specific formats.") 18 "24324A" -Bold
    Card 4.75 1.25 3.85 2.05 "F5F3FF" "C4B5FD"
    TextBox 5.05 1.55 3.25 1.25 @("ATS Score Checker", "Analyze resume keywords, formatting, and gaps against a job description.") 18 "24324A" -Bold
    Card 8.7 1.25 3.85 2.05 "F0FDF4" "9AD7B3"
    TextBox 9.0 1.55 3.25 1.25 @("Job Description Matching", "Suggest better skills, projects, and bullet points for a selected job role.") 18 "24324A" -Bold
    Card 0.8 3.75 3.85 2.05 "FFF7ED" "FDBA74"
    TextBox 1.1 4.05 3.25 1.25 @("Version History", "Allow users to compare old and new resume versions before finalizing changes.") 18 "24324A" -Bold
    Card 4.75 3.75 3.85 2.05 "F8FAFC" "CBD5E1"
    TextBox 5.05 4.05 3.25 1.25 @("Deployment Improvements", "Add Dockerized deployment, monitoring, and stronger production security.") 18 "24324A" -Bold
    Card 8.7 3.75 3.85 2.05 "FEF2F2" "FCA5A5"
    TextBox 9.0 4.05 3.25 1.25 @("Cover Letter Builder", "Generate matching cover letters using the same profile and target role.") 18 "24324A" -Bold
) -join "`n"
$slides += Make-Slide $body6

$script:shapeId = 2
$body7 = @(
    Card 0.75 0.65 11.85 6.15 "EAF6FF" "B6DDFC"
    TextBox 1.2 1.3 10.9 0.75 @("Conclusion") 40 "10233F" -Bold -Align "ctr"
    TextBox 1.45 2.35 10.45 2.0 @(
        "ResumeGenie solves a practical problem by helping users create professional resumes faster and with better structure.",
        "The project combines a modern React frontend, Spring Boot microservices, secure authentication, database storage, and AI-based resume improvement.",
        "It also shows how AI can be integrated into a real application instead of being used as a separate tool."
    ) 21 "334155" -Align "ctr"
    TextBox 1.2 5.55 10.9 0.75 @("Thank You") 42 "0F2742" -Bold -Align "ctr"
    TextBox 1.2 6.25 10.9 0.35 @("Presented by Paras Beri") 18 "475569" -Align "ctr"
) -join "`n"
$slides += Make-Slide $body7

for ($i = 0; $i -lt $slides.Count; $i++) {
    $slideNumber = $i + 1
    Write-Utf8File (Join-Path $workDir "ppt\slides\slide$slideNumber.xml") $slides[$i]
    Write-Utf8File (Join-Path $workDir "ppt\slides\_rels\slide$slideNumber.xml.rels") (SlideRel -WithImage:($slideNumber -eq 4))
}

$contentTypesSlides = (1..7 | ForEach-Object { "<Override PartName=`"/ppt/slides/slide$_.xml`" ContentType=`"application/vnd.openxmlformats-officedocument.presentationml.slide+xml`"/>" }) -join "`n"

Write-Utf8File (Join-Path $workDir "[Content_Types].xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  $contentTypesSlides
</Types>
"@

Write-Utf8File (Join-Path $workDir "_rels\.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

Write-Utf8File (Join-Path $workDir "docProps\core.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>ResumeGenie Final Assessment Presentation</dc:title>
  <dc:creator>Paras Beri</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-06-08T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-08T00:00:00Z</dcterms:modified>
</cp:coreProperties>
"@

Write-Utf8File (Join-Path $workDir "docProps\app.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>ResumeGenie Presentation Generator</Application>
  <PresentationFormat>On-screen Show (16:9)</PresentationFormat>
  <Slides>7</Slides>
</Properties>
"@

$slideIds = (1..7 | ForEach-Object { "<p:sldId id=`"$($_ + 255)`" r:id=`"rId$_`"/>" }) -join "`n"
Write-Utf8File (Join-Path $workDir "ppt\presentation.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId8"/></p:sldMasterIdLst>
  <p:sldIdLst>
    $slideIds
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="wide"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle>
    <a:defPPr><a:defRPr lang="en-US"/></a:defPPr>
  </p:defaultTextStyle>
</p:presentation>
"@

$presentationRels = (1..7 | ForEach-Object { "<Relationship Id=`"rId$_`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide`" Target=`"slides/slide$_.xml`"/>" }) -join "`n"
Write-Utf8File (Join-Path $workDir "ppt\_rels\presentation.xml.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  $presentationRels
  <Relationship Id="rId8" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
</Relationships>
"@

Write-Utf8File (Join-Path $workDir "ppt\slideMasters\slideMaster1.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>
"@

Write-Utf8File (Join-Path $workDir "ppt\slideMasters\_rels\slideMaster1.xml.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>
"@

Write-Utf8File (Join-Path $workDir "ppt\slideLayouts\slideLayout1.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>
"@

Write-Utf8File (Join-Path $workDir "ppt\slideLayouts\_rels\slideLayout1.xml.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>
"@

Write-Utf8File (Join-Path $workDir "ppt\theme\theme1.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="ResumeGenie">
  <a:themeElements>
    <a:clrScheme name="ResumeGenie">
      <a:dk1><a:srgbClr val="10233F"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="24324A"/></a:dk2>
      <a:lt2><a:srgbClr val="F7FAFC"/></a:lt2>
      <a:accent1><a:srgbClr val="2F80ED"/></a:accent1>
      <a:accent2><a:srgbClr val="22C55E"/></a:accent2>
      <a:accent3><a:srgbClr val="F97316"/></a:accent3>
      <a:accent4><a:srgbClr val="8B5CF6"/></a:accent4>
      <a:accent5><a:srgbClr val="EF4444"/></a:accent5>
      <a:accent6><a:srgbClr val="14B8A6"/></a:accent6>
      <a:hlink><a:srgbClr val="2563EB"/></a:hlink>
      <a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="ResumeGenie"><a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="ResumeGenie"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
  </a:themeElements>
</a:theme>
"@

[System.IO.Compression.ZipFile]::CreateFromDirectory($workDir, $outPath)
Remove-Item -LiteralPath $workDir -Recurse -Force

Write-Host "Created $outPath"
