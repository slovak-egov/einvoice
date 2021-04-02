import {useTranslation} from 'react-i18next'
import {Accordion, Details} from '../helpers/idsk'
import {swaggerUrl} from '../utils/constants'

const Version1 = () => (
  <>
    <Details summary="How does it work?">
      All invoices between B/G parties in Slovakia have to be submitted through the EINVOICE system
      in UBL 2.1 format.
    </Details>
    <Details summary="I am a business and want to see invoices addressed to me and issued by me.">
      Four ways:
      <ol>
        <li>
          When you are logged in WebUI, you can see invoices addressed to me and issued by me.
        </li>
        <li>
          <a href={swaggerUrl} target="_blank" rel="noreferrer noopener">API</a>
        </li>
        <li>
          All invoices in which you are one of contracting parties are sent to your ÚPVS mailbox.
        </li>
        <li>
          All of these may be done by accounts of your accountants as explained later.
        </li>
      </ol>
    </Details>
    <Details summary="I am a business and want to issue an invoice.">
      Three (maybe 4) ways:
      <ol>
        <li>
          Submit XML invoices through our simple <a href={swaggerUrl} target="_blank" rel="noreferrer noopener">API</a>.
        </li>
        <li>
          Submit XML file through WebUI.
        </li>
        <li>
          All of these may be done by accounts of your accountants as explained later.
        </li>
        <li>
          (to be decided) Maybe there will be a web form to create and submit an invoice.
        </li>
      </ol>
    </Details>
    <Details summary="I want to use an API, how do I do that?">
      It requires three one-off steps (needed only at the beginning and always
      when you want to revoke your API keys):
      <ol>
        <li>
          Login on this webpage with your company UPVS account
        </li>
        <li>
          Generate your ssh key pair. You can use any tool, but for example this command:
          <br />
          <code>
            openssl genrsa -out api-token.private.pem 2048 &&
            openssl rsa -in api-token.private.pem -pubout -out api-token.public.pem
          </code>
        </li>
        <li>
          Copy your api-token.public.pem to "API private key" field in your account settings and
          use api-token.public.pem to authorize an API
        </li>
      </ol>
      The whole solution is API first, so whatever can be done in WebUI, can be done by API.
    </Details>
    <Details summary="What validations does the system perform?">
      The system validates whether your invoice:
      <ol>
        <li>is valid UBL 2.1 or  D16B (SCRDM — CII) XML document.</li>
        <li>
          date of insertion equals to IssueDate up to 3 days (meaning yesterday, today or tomorrow,
          to account for midnights, outages, missed deadlines by 1 working day,...)
        </li>
        <li>
          <code>
            / ubl:Invoice / cac:AccountingSupplierParty / cac:Party
            / cac:PartyIdentification / cbc:ID / @schemeID == 0158
          </code>
        </li>
        <li>
          <code>
            / ubl:Invoice / cac:AccountingCustomerParty / cac:Party
            / cac:PartyIdentification / cbc:ID / @schemeID == 0158
          </code>
        </li>
        <li>
          <code>
            / ubl:Invoice / cac:AccountingSupplierParty / cac:Party
            / cac:PartyIdentification / cbc:ID == account which issues the invoice
          </code>
        </li>
        <li>
          Other semantic checks like the existence of ICDPH, DIC, Party name, address,...
          To be specified later
        </li>
      </ol>
      Otherwise it returns the invoice as invalid.
    </Details>
    <Details
      summary="I have an accountant (internal or external) who I want to delegate to do all this for me."
    >
      No Problem. It is going to be actually the most common use case.
      The very first step is still on you as a responsible person for a company,
      who can delegate responsibilities.
      Tutorial:
      <ol>
        <li>You as a responsible person will log into the WebUI with your eID.</li>
        <li>
          Everybody, who you want to be able to issue or receive invoices on your behalf
          has to log into WebUI as well and gets unique EINVOICE ENTITY ID.
        </li>
        <li>
          You, as a responsible person, go to the account settings and set those numbers
          as trusted entities to manipulate with your invoices.
          You can remove anybody anytime later.
        </li>
        <li>
          Now everybody on your list may issue and receive invoices on your behalf
          through WebUI or API.
        </li>
      </ol>
    </Details>
    <Details summary="Who is responsible for the invoice in the system?">
      Issuer, since whoever inserted invoices to the system (you, your accountant)
      was allowed in the allowed list by the entity itself.
      Moreover you have non-stop control over all invoices issued by you through WebUI,
      API and ÚPVS mailbox.
      If the invoice is found to be incorrect but already inserted to the system,
      a new corrected invoice has to be inserted to the system.
    </Details>
    <Details summary="I would love to try the EINVOICE system before I do something serious.">
      You have an option to insert a limited number of test invoices.
      The flow will be totally the same, it will be even delivered to your counterparty,
      but it will be marked as a test invoice.
      You are responsible to agree with the party you use as counterparty in advance though,
      to not spam random businesses.
      EINVOICE may delete any test invoices after some time (at least one day lifetime though).
    </Details>
    <Details summary="I am a software engineer and I would love to use your API.">
      No worries, go ahead. No need to fill the forms, register or anything else. Just enjoy.
    </Details>
    <Details
      summary="I am a software engineer and I would love to test your API before I do something serious."
    >
      You can call some APIs without hesitation - those without authorization,
      but also GET endpoints of course.
      To test out POST endpoints, you can always use the request parameter `test: true`
      for limited number of test invoices.
      This will do exactly the same thing as it would be a real request,
      but the invoice will be marked as a test invoice.
      We may delete any test invoices after some time (at least one day lifetime though).
      You will also see them on GET output so you can test the full flow.
      You are responsible to agree with the party you use as counterparty in advance though,
      to not spam random businesses.
    </Details>
    <Details summary="Something went/goes terribly wrong!">
      No worries! We are here to help you.
      Please just write an email to <a href="mailto:troubleshooting@einvoice.mfsr.sk">troubleshooting@einvoice.mfsr.sk</a>.
      Please enclose your contact details such that we can contact you as soon as possible.
      The more details you write us in an email, the faster we can solve your problem.
    </Details>
    <Details summary="I got you! You have a bug in your EINVOICE system!">
      If you are smarter than us and you managed to hack us or just unveiled an error then
      you have a chance to improve the system and even be rewarded for it.
      It does not matter if you found a typo or managed to find out our private keys.
      Just write an email to <a href="mailto:bug@einvoice.mfsr.sk">bug@einvoice.mfsr.sk</a>.
      If you are the first to report the particular issue, after our engineers
      assess the value of your contribution
      you will be rewarded from 10 to <strong>5000&euro;</strong>.
    </Details>
    <Details summary="How to add attachments to invoices?">
      Both formats support attachments internally.
    </Details>
    <Details summary="I would love to add the cool feature to the EINVOICE system.">
      The whole system is open-source on&nbsp;
      <a href="https://github.com/slovak-egov/einvoice" target="_blank" rel="noreferrer noopener">github.com</a>
      &nbsp;and you can contribute either by adding issues or ideally send a pull request.
      If you want to contribute in a way which does not suit to previously mentioned ones,
      drop us an email at <a href="mailto:ideas@einvoice.mfsr.sk">ideas@einvoice.mfsr.sk</a>
    </Details>
    <Details summary="I do not like the UI, I miss many features, can I make my own?">
      <p>Of course! It is fine to be replaced by better UI.</p>
      <p>
        We believe that the state should not supply the roles which may be equally
        or better provided by the private sector.
        Therefore we keep focusing on things, which only the government can guarantee and process.
      </p>
      <p>
        All the tools for creating, converting, visualizing, filtering, sorting, analyzing,...
        invoices may be provided by the private sector which will do it far faster, nicer,
        cheaper and better than any government.
        Our API is so simple that even any junior programmer can create such tools.
      </p>
      <p>
        A little bit more effort but still doable is to replace the whole WebUI also
        for setting up user info.
        The reason is that this depends on cumbersome UPVS integration.
      </p>
    </Details>
    <Details summary="Does the system keep logs?">
      Yes, the system keeps track of all requests and responses at least to be able to reconstruct
      the communication.
    </Details>
    <Details summary="What formats do you process and deliver invoices?">
      Basic formats given by the EU are XMLs. Those we also accept when you insert
      an invoice through API or WebUI as a file.
      When we send you invoices or let you inspect it in WebUI, we have a PDF visualization
      for you as a separate file.
      It is informative only and when it comes to legal consequences,
      XML is a single source of truth.
      So in case of any doubts, look into and rely solely on XML version.
    </Details>
    <Details summary="I do not like your PDF visualization. What can I do?">
      There are also other tools for visualizing them in human readable form.
      You can also have your own invoicing system which does it for you.
    </Details>
    <Details summary="Is something different for government entities?">
      Yes. Multiple things.
      <ol>
        <li>
          In addition to the UBL2.1 format, the government is per EU directive forced to receive
          D16B (SCRDM — CII) format.
          Government will always issue UBL2.1, though.
        </li>
        <li>
          All invoices received by the government are publicly accessible through API or WebUI.
        </li>
      </ol>
    </Details>
    <Details summary="I am a citizen/journalist/analyst, what can I do?">
      Through <a href={swaggerUrl} target="_blank" rel="noreferrer noopener">API</a> or WebUI you can access
      all public invoices received by the government, where you can search for all invoices
      by receiver, issuer, amount, date,...
      B2B invoices are unfortunately or luckily not publicly visible.
    </Details>
  </>
)

const Version2 = () => (
  <Details summary="How does it work?">
    Slovak issuers issuing invoices to the foreign country have to firstly
    send invoice to EINVOICE system, but you as the issuer are responsible
    for the delivery of the invoice as well.
    If the receiver cannot accept UBL2.1 and needs a PDF, you can see your invoice
    in "My invoices" tab in PDF version and send that one to the receiver.
  </Details>
)

const Version3 = () => (
  <Details summary="How does it work?">
    For receivers, the flow is the same.
    For issuer, you have to send invoices electronically via email
    to <a href="mailto:foreign-invoice@einvoice@mfsr.sk">foreign-invoice@einvoice@mfsr.sk</a>.
    <br />
    Title and body of an email will be ignored, just one attachment allowed,
    which is supposed to be your invoice.
    Everything else should apply from above.
    These invoices will be checked and added to the system manually and
    you get confirmation/rejection via email back.
  </Details>
)

const Version4 = () => (
  <Details summary="How does it work?">
    <strong>TBD</strong>
  </Details>
)

const Version5 = () => (
  <Details summary="How does it work?">
    <strong>TBD</strong>
  </Details>
)

export default () => {
  const {i18n, t} = useTranslation('LandingPage')
  return (
    <>
      <h1 className="govuk-heading-l">{t('faq')}</h1>
      <Accordion
        key={i18n.language}
        items={[
          {
            heading: {
              children: 'Version 1 - (B/G)2(B/G) between Slovak invoicing Parties',
            },
            content: {
              children: <Version1 />,
            },
          },
          {
            heading: {
              children: 'Version 2 - (B/G)2(B/G) for foreign receivers',
            },
            content: {
              children: <Version2 />,
            },
          },
          {
            heading: {
              children: 'Version 3 - (B/G)2G for foreign issuers',
            },
            content: {
              children: <Version3 />,
            },
          },
          {
            heading: {
              children: 'Version 4 - (B/G)2B for foreign issuers',
            },
            content: {
              children: <Version4 />,
            },
          },
          {
            heading: {
              children: 'Version 5 - (B/G)2C',
            },
            content: {
              children: <Version5 />,
            },
          },
        ]}
      />
    </>
  )
}
